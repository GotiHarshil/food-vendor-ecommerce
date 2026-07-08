// server/controllers/foodController.js
const Food = require("../models/Food");
const CartItem = require("../models/CartItem");
const Order = require("../models/Order");
const StoreSettings = require("../models/StoreSettings");
const { broadcastOrders } = require("./adminController");
const { sanitizeOrder } = require("../utils/sanitize");
const { logAudit } = require("../utils/audit");
const { sendEmail, emailTemplates } = require("../utils/emailService");
const { attemptCancelOrder, CUSTOMER_CANCELLABLE_STATUSES } = require("../utils/orderCancellation");
const stripe = require("../utils/stripeClient");

// helper
function getVisitorId(req) {
  if (req.user) return String(req.user._id);
  // Sessions use saveUninitialized:false, so an untouched session is never
  // persisted and the browser never gets a stable cookie — every guest
  // request would otherwise generate a brand-new, unretrievable sessionID.
  // Writing to req.session here forces express-session to save + set the
  // cookie as soon as a guest actually starts using the cart.
  if (!req.session.cartActive) {
    req.session.cartActive = true;
  }
  return req.sessionID;
}
module.exports.getVisitorId = getVisitorId;

// GET /api/food/menu — only visible, available, non-deleted items
module.exports.getFoods = async (req, res, next) => {
  const foods = await Food.find({
    isDeleted: { $ne: true },
    isTemporarilyHidden: { $ne: true },
  });
  res.json(foods);
};

// GET /api/food/todays-special — public endpoint
module.exports.getTodaysSpecial = async (req, res) => {
  const specials = await Food.find({
    isTodaysSpecial: true,
    isDeleted: { $ne: true },
    isTemporarilyHidden: { $ne: true },
    available: true,
  });
  res.json(specials);
};

// GET /api/food/store-info — public store info (open/closed, address, etc.)
module.exports.getStoreInfo = async (req, res) => {
  const settings = await StoreSettings.getSettings();
  res.json({
    isOpen: settings.isOpen,
    storeName: settings.storeName,
    storeAddress: settings.storeAddress,
    storePhone: settings.storePhone,
    storeEmail: settings.storeEmail,
    announcement: settings.announcement,
  });
};

// GET /api/food/stats — real stats from actual data
module.exports.getStats = async (req, res) => {
  const [totalItems, totalOrders, totalUsers] = await Promise.all([
    Food.countDocuments({ isDeleted: { $ne: true }, isTemporarilyHidden: { $ne: true } }),
    Order.countDocuments({ status: { $ne: "cancelled" } }),
    require("../models/user").countDocuments(),
  ]);

  // Average rating placeholder (can be real when reviews are added)
  res.json({
    totalItems,
    totalOrders,
    totalUsers,
  });
};

// GET /api/food/cart
module.exports.getCartItems = async (req, res, next) => {
  const userId = getVisitorId(req);
  const cartItems = await CartItem.find({ userId });

  const transformed = cartItems.map((item) => ({
    _id: item._id,
    foodId: item.foodId?._id || item.foodId,
    name: item.name,
    price: item.price,
    imageUrl: item.imageUrl,
    qty: item.qty,
    note: item.note || "",
  }));
  res.json(transformed);
};

// POST /api/food/cart/add/:id
module.exports.addToCart = async (req, res, next) => {
  const userId = getVisitorId(req);
  const foodId = req.params.id;

  const food = await Food.findById(foodId);
  if (!food) return res.status(404).json({ error: "Item doesn't exist" });
  if (!food.available) return res.status(400).json({ error: "Item is currently unavailable" });

  let item = await CartItem.findOne({ userId, foodId });

  if (item) {
    if (item.qty >= 15) {
      return res.status(400).json({ error: "Maximum 15 of this item allowed per order" });
    }

    // Check total cart items limit (40)
    const allCartItems = await CartItem.find({ userId });
    const currentTotal = allCartItems.reduce((sum, ci) => sum + ci.qty, 0);
    if (currentTotal >= 40) {
      return res.status(400).json({ error: "⚠️ Cart limit exceeded. Maximum 40 items per order." });
    }

    item.qty += 1;
    await item.save();
  } else {
    // Check total cart items limit (40) for new item
    const allCartItems = await CartItem.find({ userId });
    const currentTotal = allCartItems.reduce((sum, ci) => sum + ci.qty, 0);
    if (currentTotal >= 40) {
      return res.status(400).json({ error: "⚠️ Cart limit exceeded. Maximum 40 items per order." });
    }

    item = await CartItem.create({
      userId,
      foodId,
      name: food.name,
      price: food.price,
      imageUrl: food.imageUrl,
      qty: 1,
    });
  }

  res.json({ success: true, qty: item.qty });
};

// POST /api/food/cart/update/:id
module.exports.updateCart = async (req, res) => {
  const userId = getVisitorId(req);
  const foodId = req.params.id;
  const action = req.body.action;
  const qty = req.body.qty;

  let item = await CartItem.findOne({ userId, foodId });

  if (!item) {
    return res.status(404).json({ error: "Item not in cart" });
  }

  if (action === "inc") {
    if (item.qty >= 15) {
      return res.status(400).json({ error: "Maximum 15 of this item allowed per order" });
    }

    // Check total cart items limit (40)
    const allCartItems = await CartItem.find({ userId });
    const currentTotal = allCartItems.reduce((sum, ci) => sum + ci.qty, 0);
    if (currentTotal >= 40) {
      return res.status(400).json({ error: "⚠️ Cart limit exceeded. Maximum 40 items per order." });
    }

    item.qty++;
  } else if (action === "dec") {
    item.qty--;
    if (item.qty <= 0) {
      await CartItem.deleteOne({ userId, foodId });
      return res.json({ success: true, deleted: true });
    }
  } else if (action === "set" && qty) {
    const newQty = parseInt(qty);
    if (newQty <= 0) {
      await CartItem.deleteOne({ userId, foodId });
      return res.json({ success: true, deleted: true });
    }
    if (newQty > 15) {
      return res.status(400).json({ error: "Maximum 15 of this item allowed per order" });
    }

    // Check total cart items limit (40) when increasing quantity via set
    if (newQty > item.qty) {
      const allCartItems = await CartItem.find({ userId });
      const currentTotal = allCartItems.reduce((sum, ci) => sum + ci.qty, 0);
      const increaseBy = newQty - item.qty;
      if (currentTotal + increaseBy > 40) {
        return res.status(400).json({ error: "⚠️ Cart limit exceeded. Maximum 40 items per order." });
      }
    }
    item.qty = newQty;
  }

  await item.save();
  res.json({ success: true, qty: item.qty });
};

// POST /api/food/checkout/create-session — create the Order (unpaid) and a Stripe
// Checkout Session for it (requires login via route middleware).
//
// The Order is created here, synchronously, rather than in the webhook — this keeps
// the full cart snapshot (name/price/imageUrl/notes) as a normal DB write instead of
// having to cram it into Stripe's metadata (which caps each value at 500 chars —
// easily blown past by a 40-item cart with per-item notes). The order starts
// `paymentStatus: "unpaid"` and is excluded from the admin queue until the webhook
// confirms payment, so the kitchen never sees an order nobody has paid for.
module.exports.createCheckoutSession = async (req, res) => {
  // Check if store is open
  const settings = await StoreSettings.getSettings();
  if (!settings.isOpen) {
    return res.status(400).json({ error: "Sorry, the store is currently closed. Please try again later." });
  }

  const userId = String(req.user._id);

  // Check if user already has 2 incomplete *paid* orders (an abandoned/unpaid
  // checkout attempt must never block the customer from trying again)
  const incompleteOrders = await Order.countDocuments({
    userId: req.user._id,
    status: { $in: ["pending", "preparing", "ready"] },
    paymentStatus: "paid",
  });

  if (incompleteOrders >= 2) {
    return res.status(400).json({
      error: "You already have 2 active orders. Please wait for one to be completed or picked up before placing a new order."
    });
  }

  const cartItems = await CartItem.find({ userId });

  if (cartItems.length === 0) {
    return res.status(400).json({ error: "Your cart is empty" });
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);
  if (totalItems > 40) {
    return res.status(400).json({ error: "Maximum 40 items per order. Please reduce quantities." });
  }

  const NOTE_MAX = 500;
  const note = (req.body.note || "").slice(0, NOTE_MAX);
  const itemNotes = req.body.itemNotes;

  // Update cart items with notes from frontend if provided
  if (itemNotes && typeof itemNotes === "object" && !Array.isArray(itemNotes)) {
    for (const itemId of Object.keys(itemNotes)) {
      const cartItem = cartItems.find(ci => ci._id.toString() === itemId);
      if (cartItem) {
        cartItem.note = (itemNotes[itemId] || "").slice(0, NOTE_MAX);
        await cartItem.save();
      }
    }
  }

  const orderItems = cartItems.map((ci) => ({
    foodId: ci.foodId,
    name: ci.name,
    price: ci.price,
    imageUrl: ci.imageUrl,
    qty: ci.qty,
    note: ci.note || "",  // include item-specific notes
  }));

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  const order = await Order.create({
    userId: req.user._id,
    customerName: req.user.name || req.user.email,
    customerEmail: req.user.email,
    items: orderItems,
    subtotal,
    note: note || "",
    status: "pending",
    paymentStatus: "unpaid",
  });

  logAudit(req, "ORDER_CREATED", "Order", order._id, { subtotal: order.subtotal, itemCount: order.items.length });

  const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: req.user.email,
      line_items: orderItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.qty,
      })),
      success_url: `${clientUrl}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/cart`,
      metadata: { orderId: String(order._id) },
    });
  } catch (err) {
    // Payment session couldn't be created — don't leave a dangling unpaid Order behind
    await Order.deleteOne({ _id: order._id });
    console.error("[Stripe] Failed to create checkout session:", err);
    return res.status(502).json({ error: "Could not start payment. Please try again." });
  }

  order.stripeCheckoutSessionId = session.id;
  await order.save();

  res.json({ url: session.url });
};

// GET /api/food/checkout/session/:sessionId — look up the order created for a Stripe
// Checkout Session (used by the order-confirmation page after the Stripe redirect).
module.exports.getCheckoutSession = async (req, res) => {
  const order = await Order.findOne({ stripeCheckoutSessionId: req.params.sessionId });
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (String(order.userId) !== String(req.user._id) && req.user.role !== "admin") {
    return res.status(403).json({ error: "Not authorized to view this order" });
  }
  res.json(sanitizeOrder(order, req.user.role));
};

// POST /api/food/orders/:id/cancel — customer-initiated cancel (requires ownership
// via route middleware). Only allowed while the order is still "pending" — once the
// kitchen starts preparing it, the customer must contact the vendor.
module.exports.cancelMyOrder = async (req, res) => {
  const order = req.resource; // attached by requireOwns middleware
  const reason = (req.body.reason || "Cancelled by customer").slice(0, 500);

  const result = await attemptCancelOrder(order, {
    reason,
    cancelledBy: "customer",
    allowedStatuses: CUSTOMER_CANCELLABLE_STATUSES,
  });

  if (!result.ok) {
    return res.status(400).json({ error: result.error });
  }

  const emailContent = emailTemplates.orderCancelled(result.order, req.user, reason);
  sendEmail(req.user.email, emailContent.subject, emailContent.html).catch(console.error);

  logAudit(req, "ORDER_CANCELLED", "Order", result.order._id, { reason, cancelledBy: "customer" });
  broadcastOrders().catch(console.error);

  res.json({
    success: true,
    message: result.order.paymentStatus === "refund_pending"
      ? "Order cancelled. Your refund is being processed."
      : "Order cancelled.",
    order: sanitizeOrder(result.order, req.user.role),
  });
};

// GET /api/food/my-orders — user's own orders (requires login via route middleware)
module.exports.getMyOrders = async (req, res) => {
  const orders = await Order.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  res.json(orders.map((o) => sanitizeOrder(o, req.user.role)));
};

// GET /api/food/orders/:id — single order (requires ownership via route middleware)
module.exports.getOrderById = async (req, res) => {
  const order = sanitizeOrder(req.resource, req.user.role);
  res.json(order);
};
