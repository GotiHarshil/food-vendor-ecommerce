// server/models/Order.js
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food" },
  name: String,
  price: Number,
  imageUrl: String,
  qty: { type: Number, default: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "picked_up", "cancelled"],
      default: "pending",
    },
    note: String, // customer note
    adminNote: String, // admin note (e.g. cancellation reason)
    readyNotifiedAt: Date, // when customer was notified order is ready
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
