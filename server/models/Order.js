// server/models/Order.js
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food" },
  name: String,
  price: Number,
  imageUrl: String,
  qty: { type: Number, default: 1 },
  note: String,  // special instructions for this item
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
    note: String,      // customer note (English)
    noteHindi: String, // AI-translated note (Hindi)
    adminNote: String, // admin note (e.g. cancellation reason)
    readyNotifiedAt: Date, // when customer was notified order is ready

    // Payment (Stripe)
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refund_pending", "refunded", "payment_failed"],
      default: "unpaid",
    },
    stripeCheckoutSessionId: { type: String, index: true },
    stripePaymentIntentId: String,
    stripeCustomerId: String,
    paidAt: Date,

    // Cancellation
    cancelledAt: Date,
    cancelledBy: { type: String, enum: ["customer", "admin"] },
    cancelReason: String, // customer-visible reason (distinct from internal adminNote)

    // Refund
    refund: {
      stripeRefundId: String,
      amount: Number, // cents
      status: { type: String, enum: ["none", "pending", "succeeded", "failed"], default: "none" },
      refundedAt: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
