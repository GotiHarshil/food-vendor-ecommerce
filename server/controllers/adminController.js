// server/controllers/adminController.js
const Food = require("../models/Food");
const Order = require("../models/Order");
const User = require("../models/user");
const CartItem = require("../models/cartItem");
const StoreSettings = require("../models/StoreSettings");
const AuditLog = require("../models/AuditLog");
const { logAudit } = require("../utils/audit");
const { uploadToCloudinary } = require("../utils/uploadToCloudinary");

// SSE clients for real-time order push
const sseClients = new Set();

async function broadcastOrders() {
  if (sseClients.size === 0) return;
  const orders = await Order.find({}).sort({ createdAt: -1 }).limit(100).lean();
  const payload = `data: ${JSON.stringify(orders)}\n\n`;
  for (const client of sseClients) {
    try {
      if (client.writableEnded) { sseClients.delete(client); continue; }
      client.write(payload);
    } catch (_) {
      sseClients.delete(client);
    }
  }
}
module.exports.broadcastOrders = broadcastOrders;

// ─── DASHBOARD ──────────────────────────────────────────────
module.exports.getDashboard = async (req, res) => {
  const [
    totalOrders,
    pendingOrders,
    preparingOrders,
    readyOrders,
    cancelledOrders,
    pickedUpOrders,
    totalUsers,
    totalItems,
    orders,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: "pending" }),
    Order.countDocuments({ status: "preparing" }),
    Order.countDocuments({ status: "ready" }),
    Order.countDocuments({ status: "cancelled" }),
    Order.countDocuments({ status: "picked_up" }),
    User.countDocuments(),
    Food.countDocuments({ isDeleted: false }),
    Order.find({ status: { $ne: "cancelled" } }),
  ]);

  // Calculate total revenue from non-cancelled orders
  const totalRevenue = orders.reduce((sum, o) => sum + (o.subtotal || 0), 0);

  // Most sold items — aggregate from order items
  const mostSoldPipeline = [
    { $match: { status: { $ne: "cancelled" } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.foodId",
        name: { $first: "$items.name" },
        imageUrl: { $first: "$items.imageUrl" },
        totalQty: { $sum: "$items.qty" },
        totalRevenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
      },
    },
    { $sort: { totalQty: -1 } },
    { $limit: 10 },
  ];
  const mostSold = await Order.aggregate(mostSoldPipeline);

  // Recent orders (latest 10)
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  // Sales over last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const dailySales = await Order.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo }, status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$subtotal" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const settings = await StoreSettings.getSettings();

  res.json({
    stats: {
      totalOrders,
      pendingOrders,
      preparingOrders,
      readyOrders,
      cancelledOrders,
      pickedUpOrders,
      totalUsers,
      totalItems,
      totalRevenue,
    },
    mostSold,
    recentOrders,
    dailySales,
    storeIsOpen: settings.isOpen,
  });
};

// ─── STORE SETTINGS ─────────────────────────────────────────
module.exports.getStoreSettings = async (req, res) => {
  const settings = await StoreSettings.getSettings();
  res.json(settings);
};

module.exports.updateStoreSettings = async (req, res) => {
  const updates = req.body;
  const settings = await StoreSettings.getSettings();

  // Only update allowed fields
  const allowed = ["isOpen", "storeName", "storeAddress", "storePhone", "storeEmail", "announcement"];
  allowed.forEach((key) => {
    if (updates[key] !== undefined) settings[key] = updates[key];
  });

  await settings.save();
  res.json(settings);
};

// ─── FOOD ITEMS ─────────────────────────────────────────────
module.exports.getAllItems = async (req, res) => {
  // Admin sees everything including hidden/deleted
  const items = await Food.find().sort({ category: 1, name: 1 });
  res.json(items);
};

module.exports.createItem = async (req, res) => {
  const { name, price, description, category } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: "Name, price, and category are required" });
  }

  let imageUrl = req.body.imageUrl || "";

  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.buffer, `${name.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}`);
      imageUrl = result.secure_url;
    } catch (error) {
      return res.status(400).json({ error: `Image upload failed: ${error.message}` });
    }
  }

  const item = await Food.create({ name, price, description, imageUrl, category });
  logAudit(req, "ITEM_CREATED", "Food", item._id, { name });
  res.status(201).json(item);
};

module.exports.updateItem = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const allowed = [
    "name", "price", "description", "imageUrl", "category",
    "available", "isTodaysSpecial", "isTemporarilyHidden",
  ];

  const updateObj = {};
  allowed.forEach((key) => {
    if (updates[key] !== undefined) updateObj[key] = updates[key];
  });

  // Handle new image upload
  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.buffer, `${updates.name || "item"}-${Date.now()}`);
      updateObj.imageUrl = result.secure_url;
    } catch (error) {
      return res.status(400).json({ error: `Image upload failed: ${error.message}` });
    }
  }

  const item = await Food.findByIdAndUpdate(id, updateObj, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ error: "Item not found" });
  logAudit(req, "ITEM_UPDATED", "Food", id, updateObj);
  res.json(item);
};

module.exports.deleteItem = async (req, res) => {
  const { id } = req.params;
  const { permanent } = req.query;

  if (permanent === "true") {
    await Food.findByIdAndDelete(id);
    logAudit(req, "ITEM_DELETED", "Food", id, { permanent: true });
    return res.json({ success: true, message: "Permanently deleted" });
  }

  // Soft delete
  const item = await Food.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  if (!item) return res.status(404).json({ error: "Item not found" });
  logAudit(req, "ITEM_DELETED", "Food", id, { permanent: false });
  res.json({ success: true, message: "Item soft-deleted", item });
};

module.exports.restoreItem = async (req, res) => {
  const { id } = req.params;
  const item = await Food.findByIdAndUpdate(id, { isDeleted: false }, { new: true });
  if (!item) return res.status(404).json({ error: "Item not found" });
  res.json(item);
};

// Today's special — set/unset
module.exports.setTodaysSpecial = async (req, res) => {
  const { itemIds } = req.body; // array of food IDs to mark as today's special

  // Clear all existing specials
  await Food.updateMany({}, { isTodaysSpecial: false });

  // Set new specials
  if (itemIds && itemIds.length > 0) {
    await Food.updateMany(
      { _id: { $in: itemIds } },
      { isTodaysSpecial: true }
    );
  }

  const specials = await Food.find({ isTodaysSpecial: true });
  res.json(specials);
};

// ─── ORDERS ─────────────────────────────────────────────────
module.exports.streamOrders = async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  sseClients.add(res);

  // Heartbeat every 25 s keeps the TCP connection alive through proxies/browsers
  const heartbeat = setInterval(() => {
    try {
      res.write(": ping\n\n");
    } catch (_) {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
  }, 25000);

  // Register BEFORE any await to avoid race with early disconnect
  req.on("close", () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });

  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(100).lean();
    res.write(`data: ${JSON.stringify(orders)}\n\n`);
  } catch (err) {
    console.error("SSE initial fetch error:", err);
  }
};

module.exports.getAllOrders = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status && status !== "all") filter.status = status;

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  const total = await Order.countDocuments(filter);

  res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
};

module.exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, adminNote } = req.body;

  const validStatuses = ["pending", "preparing", "ready", "picked_up", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const existing = await Order.findById(id).select("status").lean();
  if (!existing) return res.status(404).json({ error: "Order not found" });

  const updateObj = { status };
  if (adminNote) updateObj.adminNote = adminNote;
  if (status === "ready") updateObj.readyNotifiedAt = new Date();

  const order = await Order.findByIdAndUpdate(id, updateObj, { new: true });
  res.json(order);
  logAudit(req, "ORDER_STATUS_CHANGED", "Order", id, { from: existing.status, to: status });
  broadcastOrders().catch(console.error);
};

module.exports.cancelOrder = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const order = await Order.findByIdAndUpdate(
    id,
    { status: "cancelled", adminNote: reason || "Cancelled by admin" },
    { new: true }
  );
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
  logAudit(req, "ORDER_CANCELLED", "Order", id, { reason });
  broadcastOrders().catch(console.error);
};

// ─── USERS ──────────────────────────────────────────────────
module.exports.getAllUsers = async (req, res) => {
  const users = await User.find().select("-salt -hash").sort({ createdAt: -1 }).lean();
  res.json(users);
};

module.exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!["customer", "admin"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }
  const existing = await User.findById(id).select("role").lean();
  if (!existing) return res.status(404).json({ error: "User not found" });
  const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select("-salt -hash");
  logAudit(req, "USER_ROLE_CHANGED", "User", id, { from: existing.role, to: role });
  res.json(user);
};

// ─── AUDIT LOGS ──────────────────────────────────────────────
module.exports.getAuditLogs = async (req, res) => {
  const { page = 1, limit = 50, action } = req.query;
  const filter = {};
  if (action) filter.action = action;

  const logs = await AuditLog.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  const total = await AuditLog.countDocuments(filter);

  res.json({ logs, total, page: Number(page), pages: Math.ceil(total / limit) });
};
