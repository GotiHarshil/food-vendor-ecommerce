// server/models/Review.js
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 1000 },
  },
  { timestamps: true }
);

// One review per (user, food item, order) — a customer can review the same dish
// again if they order it on a later order, but not spam multiple reviews for the
// same item within one order.
reviewSchema.index({ userId: 1, foodId: 1, orderId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
