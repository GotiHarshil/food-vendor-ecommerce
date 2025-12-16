const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  userId: { type: String, required: true },       // session id or user id
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
  name: String,
  price: Number,
  imageUrl: String,
  qty: { type: Number, default: 1 },
});

module.exports = mongoose.model("CartItem", CartItemSchema);
