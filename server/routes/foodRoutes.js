// server/routes/foodRoutes.js
const express = require("express");
const router = express.Router();
const foodController = require("../controllers/foodController");
const wrapAsync = require("../utils/wrapAsync");
const CartItem = require("../models/cartItem");

// Public endpoints
router.get("/ping", (req, res) => {
  res.json({ ok: true, message: "API is working" });
});

router.get("/menu", wrapAsync(foodController.getFoods));
router.get("/todays-special", wrapAsync(foodController.getTodaysSpecial));
router.get("/store-info", wrapAsync(foodController.getStoreInfo));
router.get("/stats", wrapAsync(foodController.getStats));

// Cart
router.get("/cart", wrapAsync(foodController.getCartItems));
router.post("/cart/add/:id", wrapAsync(foodController.addToCart));
router.post("/cart/update/:id", wrapAsync(foodController.updateCart));

// Remove from cart
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

// Checkout & orders
router.post("/checkout", wrapAsync(foodController.checkout));
router.get("/my-orders", wrapAsync(foodController.getMyOrders));

module.exports = router;
