// server/routes/foodRoutes.js
const express = require("express");
const router = express.Router();
const foodController = require("../controllers/foodController");
const wrapAsync = require("../utils/wrapAsync");
const CartItem = require("../models/CartItem");
const Order = require("../models/Order");
const { checkoutLimiter } = require("../middleware/rateLimiter");
const { isLoggedIn } = require("../middleware");
const { requireOwns } = require("../middleware/ownsResource");
const { logAudit } = require("../utils/audit");

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
    if (result.deletedCount > 0 && req.user) {
      logAudit(req, "CART_REMOVED", "CartItem", foodId, { userId });
    }
    if (req.headers["x-requested-with"] === "XMLHttpRequest" || req.accepts("json")) {
      return res.json({ success: true, deletedCount: result.deletedCount });
    }
    res.redirect("back");
  })
);

// Checkout & orders
router.post("/checkout", isLoggedIn, checkoutLimiter, wrapAsync(foodController.checkout));
router.get("/my-orders", isLoggedIn, wrapAsync(foodController.getMyOrders));
router.get("/orders/:id", isLoggedIn, wrapAsync(requireOwns(Order, "userId")), wrapAsync(foodController.getOrderById));

module.exports = router;
