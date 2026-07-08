// server/controllers/reviewController.js
const mongoose = require("mongoose");
const Review = require("../models/Review");
const Order = require("../models/Order");
const Food = require("../models/Food");
const { logAudit } = require("../utils/audit");

async function recalculateFoodRating(foodId) {
  const [stats] = await Review.aggregate([
    { $match: { foodId: new mongoose.Types.ObjectId(String(foodId)) } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  await Food.findByIdAndUpdate(foodId, {
    avgRating: stats ? Math.round(stats.avg * 10) / 10 : 0,
    reviewCount: stats ? stats.count : 0,
  });
}

// POST /api/food/reviews — { orderId, foodId, rating, comment } (requires login)
module.exports.createReview = async (req, res) => {
  const { orderId, foodId, rating, comment } = req.body;

  if (!orderId || !foodId) {
    return res.status(400).json({ error: "orderId and foodId are required" });
  }

  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: "Rating must be an integer between 1 and 5" });
  }

  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (String(order.userId) !== String(req.user._id)) {
    return res.status(403).json({ error: "Not authorized to review this order" });
  }
  if (order.status !== "picked_up") {
    return res.status(400).json({ error: "You can only review items from a completed order" });
  }
  const orderedItem = order.items.find((item) => String(item.foodId) === String(foodId));
  if (!orderedItem) {
    return res.status(400).json({ error: "This food item wasn't part of that order" });
  }

  let review;
  try {
    review = await Review.create({
      userId: req.user._id,
      foodId,
      orderId,
      rating: ratingNum,
      comment: (comment || "").slice(0, 1000),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "You've already reviewed this item for this order" });
    }
    throw err;
  }

  await recalculateFoodRating(foodId);
  logAudit(req, "REVIEW_CREATED", "Review", review._id, { foodId, orderId, rating: ratingNum });

  res.json({ success: true, review });
};

// PUT /api/food/reviews/:id — { rating, comment } (requires ownership via route middleware)
module.exports.updateReview = async (req, res) => {
  const review = req.resource;
  const { rating, comment } = req.body;

  if (rating !== undefined) {
    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: "Rating must be an integer between 1 and 5" });
    }
    review.rating = ratingNum;
  }
  if (comment !== undefined) {
    review.comment = String(comment).slice(0, 1000);
  }
  await review.save();
  await recalculateFoodRating(review.foodId);
  logAudit(req, "REVIEW_UPDATED", "Review", review._id, { rating: review.rating });

  res.json({ success: true, review });
};

// DELETE /api/food/reviews/:id (requires ownership via route middleware)
module.exports.deleteReview = async (req, res) => {
  const review = req.resource;
  const foodId = review.foodId;

  await Review.deleteOne({ _id: review._id });
  await recalculateFoodRating(foodId);
  logAudit(req, "REVIEW_DELETED", "Review", review._id, { foodId });

  res.json({ success: true });
};

// GET /api/food/orders/:id/reviews — this user's reviews for a specific order
// (requires ownership via route middleware), so the frontend knows which items
// in a picked-up order are already reviewed.
module.exports.getOrderReviews = async (req, res) => {
  const reviews = await Review.find({ orderId: req.resource._id, userId: req.user._id }).lean();
  res.json(reviews);
};

module.exports.recalculateFoodRating = recalculateFoodRating;
