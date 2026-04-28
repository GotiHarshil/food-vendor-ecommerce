// server/controllers/foodController.js
const Food = require("../models/Food");
const CartItem = require("../models/cartItem");
const Order = require("../models/Order");
const StoreSettings = require("../models/StoreSettings");

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
    item.qty += 1;
    await item.save();
  } else {
    item = await CartItem.create({
      userId,
      foodId,
      name: food.name,
      price: food.price,
      imageUrl: food.imageUrl,
      qty: 1,
    });
  }

  if (req.headers["x-requested-with"] === "XMLHttpRequest") {
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

  let item = await CartItem.findOne({ userId, foodId });

  if (!item) {
    if (req.headers["x-requested-with"] === "XMLHttpRequest") {
      return res.status(404).json({ error: "Item not in cart" });
    }
    return res.redirect("back");
  }

  if (action === "inc") {
    item.qty++;
  } else if (action === "dec") {
    item.qty--;
    if (item.qty <= 0) {
      await CartItem.deleteOne({ userId, foodId });
      if (req.headers["x-requested-with"] === "XMLHttpRequest") {
        return res.json({ success: true, deleted: true });
      }
      return res.redirect("back");
    }
  } else if (action === "set" && qty) {
    const newQty = parseInt(qty);
    if (newQty <= 0) {
      await CartItem.deleteOne({ userId, foodId });
      if (req.headers["x-requested-with"] === "XMLHttpRequest") {
        return res.json({ success: true, deleted: true });
      }
      return res.redirect("back");
    }
    item.qty = newQty;
  }

  await item.save();

  if (req.headers["x-requested-with"] === "XMLHttpRequest") {
    return res.json({ success: true, qty: item.qty });
  }

  return res.redirect("back");
};

// POST /api/food/checkout — place order (requires login)
module.exports.checkout = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Please log in to place an order" });
  }

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

  res.json({
    success: true,
    message: "Order placed! You'll be notified when it's ready for pickup.",
    order,
  });
};

// GET /api/food/my-orders — user's own orders
module.exports.getMyOrders = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Please log in" });
  }

  const orders = await Order.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  res.json(orders);
};
