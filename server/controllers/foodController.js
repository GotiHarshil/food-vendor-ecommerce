// server/controllers/foodController.js
const Food = require("../models/Food");
const CartItem = require("../models/cartItem");
const Order = require("../models/Order");
const StoreSettings = require("../models/StoreSettings");
const { broadcastOrders } = require("./adminController");
const { sanitizeOrder } = require("../utils/sanitize");
const { logAudit } = require("../utils/audit");
const { sendEmail, emailTemplates } = require("../utils/emailService");

// helper
function getVisitorId(req) {
  return req.user ? String(req.user._id) : req.sessionID;
}

// GET /api/food/menu — only visible, available, non-deleted items
module.exports.getFoods = async (req, res, next) => {
  const foods = await Food.find({
    isDeleted: { $ne: true },
    isTemporarilyHidden: { $ne: true },
  });

  if (
    req.headers["x-requested-with"] === "XMLHttpRequest" ||
    req.accepts("json")
  ) {
    return res.json(foods);
  }

  const userId = getVisitorId(req);
  const cartItems = await CartItem.find({ userId });
  res.render("pages/menu", { foods, cartItems });
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
  const cartItems = await CartItem.find({ userId }).populate("foodId");

  if (
    req.headers["x-requested-with"] === "XMLHttpRequest" ||
    req.accepts("json")
  ) {
    const transformed = cartItems.map((item) => ({
      _id: item._id,
      foodId: item.foodId?._id || item.foodId,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      qty: item.qty,
    }));
    return res.json(transformed);
  }

  res.render("pages/cart", { cartItems });
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
      if (req.headers["x-requested-with"] === "XMLHttpRequest" || req.accepts("json")) {
        return res.status(400).json({ error: "Maximum 15 of this item allowed per order" });
      }
      return res.redirect("back");
    }

    // Check total cart items limit (40)
    const allCartItems = await CartItem.find({ userId });
    const currentTotal = allCartItems.reduce((sum, ci) => sum + ci.qty, 0);
    if (currentTotal >= 40) {
      if (req.headers["x-requested-with"] === "XMLHttpRequest" || req.accepts("json")) {
        return res.status(400).json({ error: "⚠️ Cart limit exceeded. Maximum 40 items per order." });
      }
      return res.redirect("back");
    }

    item.qty += 1;
    await item.save();
  } else {
    // Check total cart items limit (40) for new item
    const allCartItems = await CartItem.find({ userId });
    const currentTotal = allCartItems.reduce((sum, ci) => sum + ci.qty, 0);
    if (currentTotal >= 40) {
      if (req.headers["x-requested-with"] === "XMLHttpRequest" || req.accepts("json")) {
        return res.status(400).json({ error: "⚠️ Cart limit exceeded. Maximum 40 items per order." });
      }
      return res.redirect("back");
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

  if (req.headers["x-requested-with"] === "XMLHttpRequest" || req.accepts("json")) {
    return res.json({ success: true, qty: item.qty });
  }

  res.redirect("/api/food/menu");
};

// POST /api/food/cart/update/:id
module.exports.updateCart = async (req, res) => {
  const userId = req.user ? String(req.user._id) : req.sessionID;
  const foodId = req.params.id;
  const action = req.body.action;
  const qty = req.body.qty;
  const wantsJson = req.headers["x-requested-with"] === "XMLHttpRequest" || req.accepts("json");

  let item = await CartItem.findOne({ userId, foodId });

  if (!item) {
    if (wantsJson) return res.status(404).json({ error: "Item not in cart" });
    return res.redirect("back");
  }

  if (action === "inc") {
    if (item.qty >= 15) {
      if (wantsJson) return res.status(400).json({ error: "Maximum 15 of this item allowed per order" });
      return res.redirect("back");
    }

    // Check total cart items limit (40)
    const allCartItems = await CartItem.find({ userId });
    const currentTotal = allCartItems.reduce((sum, ci) => sum + ci.qty, 0);
    if (currentTotal >= 40) {
      if (wantsJson) return res.status(400).json({ error: "⚠️ Cart limit exceeded. Maximum 40 items per order." });
      return res.redirect("back");
    }

    item.qty++;
  } else if (action === "dec") {
    item.qty--;
    if (item.qty <= 0) {
      await CartItem.deleteOne({ userId, foodId });
      if (wantsJson) return res.json({ success: true, deleted: true });
      return res.redirect("back");
    }
  } else if (action === "set" && qty) {
    const newQty = parseInt(qty);
    if (newQty <= 0) {
      await CartItem.deleteOne({ userId, foodId });
      if (wantsJson) return res.json({ success: true, deleted: true });
      return res.redirect("back");
    }
    if (newQty > 15) {
      if (wantsJson) return res.status(400).json({ error: "Maximum 15 of this item allowed per order" });
      return res.redirect("back");
    }

    // Check total cart items limit (40) when increasing quantity via set
    if (newQty > item.qty) {
      const allCartItems = await CartItem.find({ userId });
      const currentTotal = allCartItems.reduce((sum, ci) => sum + ci.qty, 0);
      const increaseBy = newQty - item.qty;
      if (currentTotal + increaseBy > 40) {
        if (wantsJson) return res.status(400).json({ error: "⚠️ Cart limit exceeded. Maximum 40 items per order." });
        return res.redirect("back");
      }
    }
    item.qty = newQty;
  }

  await item.save();

  if (wantsJson) return res.json({ success: true, qty: item.qty });
  return res.redirect("back");
};

// POST /api/food/checkout — place order (requires login via route middleware)
module.exports.checkout = async (req, res) => {
  // Check if store is open
  const settings = await StoreSettings.getSettings();
  if (!settings.isOpen) {
    return res.status(400).json({ error: "Sorry, the store is currently closed. Please try again later." });
  }

  const userId = String(req.user._id);
  const cartItems = await CartItem.find({ userId });

  if (cartItems.length === 0) {
    return res.status(400).json({ error: "Your cart is empty" });
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);
  if (totalItems > 40) {
    return res.status(400).json({ error: "Maximum 40 items per order. Please reduce quantities." });
  }

  const { note } = req.body;

  const orderItems = cartItems.map((ci) => ({
    foodId: ci.foodId,
    name: ci.name,
    price: ci.price,
    imageUrl: ci.imageUrl,
    qty: ci.qty,
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
  });

  // Clear the cart
  await CartItem.deleteMany({ userId });

  // Notify connected admin clients of the new order
  broadcastOrders().catch(console.error);

  // Send confirmation email
  const emailContent = emailTemplates.orderConfirmation(order, req.user);
  sendEmail(req.user.email, emailContent.subject, emailContent.html).catch(console.error);

  // Audit log
  logAudit(req, "ORDER_CREATED", "Order", order._id, { subtotal: order.subtotal, itemCount: order.items.length });

  res.json({
    success: true,
    message: "Order placed! You'll be notified when it's ready for pickup.",
    order: sanitizeOrder(order, req.user.role),
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
