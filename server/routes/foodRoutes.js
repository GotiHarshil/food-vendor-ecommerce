// server/routes/foodRoutes.js
const express = require("express");
const router = express.Router();
const foodController = require("../controllers/foodController");
const wrapAsync = require("../utils/wrapAsync");
const CartItem = require("../models/cartItem");

// Simple test endpoint
router.get("/ping", (req, res) => {
  res.json({ ok: true, message: "API is working" });
});

router.get("/menu", wrapAsync(foodController.getFoods));
router.get("/cart", wrapAsync(foodController.getCartItems));
router.post("/cart/add/:id", wrapAsync(foodController.addToCart));
router.post("/cart/update/:id", wrapAsync(foodController.updateCart));

// POST /api/food/cart/remove/:id - Remove item from cart
router.post(
  "/cart/remove/:id",
  wrapAsync(async (req, res) => {
    const userId = req.user ? String(req.user._id) : req.sessionID;
    const foodId = req.params.id;

    const result = await CartItem.deleteOne({ userId, foodId });

    if (req.headers["x-requested-with"] === "XMLHttpRequest") {
      return res.json({ success: true, deletedCount: result.deletedCount });
    }

    res.redirect("back");
  })
);

// router.get("/:id", foodController.getFoodById);
// router.post("/", foodController.createFood);

module.exports = router;
