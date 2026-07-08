const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const verifyToken = require("../middleware/verifyToken");

// ── Admin-only guard ───────────────────────────────────────
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// ── POST /orders — create order (customer) ─────────────────
router.post("/", verifyToken, async (req, res) => {
  try {
    const { items, subtotal, note } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "items are required" });
    }
    if (!subtotal) {
      return res.status(400).json({ error: "subtotal is required" });
    }

    const order = await Order.create({
      userId: req.user.id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      items,
      subtotal,
      note: note || "",
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /orders/my — customer's own orders ─────────────────
router.get("/my", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /orders — all orders (admin) ──────────────────────
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Order.countDocuments(filter);

    res.json({ success: true, orders, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /orders/:id — single order ────────────────────────
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // customers can only see their own orders
    if (req.user.role !== "admin" && order.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /orders/:id/status — update status (admin) ─────────
router.put("/:id/status", verifyToken, isAdmin, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const validStatuses = ["pending", "preparing", "ready", "picked_up", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${validStatuses.join(", ")}` });
    }

    const update = { status };
    if (adminNote) update.adminNote = adminNote;
    if (status === "ready") update.readyNotifiedAt = new Date();

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /orders/:id/cancel — cancel order ─────────────────
router.post("/:id/cancel", verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // customers can only cancel their own orders
    if (req.user.role !== "admin" && order.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({ error: "Order already cancelled" });
    }
    if (order.status === "picked_up") {
      return res.status(400).json({ error: "Cannot cancel a picked-up order" });
    }

    const { cancelReason } = req.body;
    order.status = "cancelled";
    order.cancelledAt = new Date();
    order.cancelledBy = req.user.role === "admin" ? "admin" : "customer";
    if (cancelReason) order.cancelReason = cancelReason;
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /orders/:id/note-hindi — store translated note (internal) ──
router.patch("/:id/note-hindi", verifyToken, isAdmin, async (req, res) => {
  try {
    const { noteHindi } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { noteHindi },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
