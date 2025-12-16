// server/models/Food.js
const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    imageUrl: String,
    category: {
      type: String,
      enum: [ 
        "Signature Dabeli",
        "Spicy Specials",
        "Loaded Varieties",
        "Snackes and sides",
        "Bevarages"
      ],
    },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Food", foodSchema);
