const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  foodId: { type: mongoose.Schema.Types.ObjectId },
  name: String,
  price: Number,
  imageUrl: String,
  qty: { type: Number, default: 1 },
  note: String,
});

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "picked_up", "cancelled"],
      default: "pending",
    },
    note: String,
    noteHindi: String,
    adminNote: String,
    readyNotifiedAt: Date,

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
    cancelReason: String,

    // Refund
    refund: {
      stripeRefundId: String,
      amount: Number,
      status: {
        type: String,
        enum: ["none", "pending", "succeeded", "failed"],
        default: "none",
      },
      refundedAt: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
