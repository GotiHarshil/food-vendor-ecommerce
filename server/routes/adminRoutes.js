// server/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { isAdmin } = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");

// All admin routes require admin authentication
router.use(isAdmin);

// Dashboard
router.get("/dashboard", wrapAsync(adminController.getDashboard));

// Store settings
router.get("/settings", wrapAsync(adminController.getStoreSettings));
router.put("/settings", wrapAsync(adminController.updateStoreSettings));

// Food items
router.get("/items", wrapAsync(adminController.getAllItems));
router.post("/items", wrapAsync(adminController.createItem));
router.put("/items/:id", wrapAsync(adminController.updateItem));
router.delete("/items/:id", wrapAsync(adminController.deleteItem));
router.post("/items/:id/restore", wrapAsync(adminController.restoreItem));

// Today's special
router.post("/todays-special", wrapAsync(adminController.setTodaysSpecial));

// Orders
router.get("/orders/stream", adminController.streamOrders);
router.get("/orders", wrapAsync(adminController.getAllOrders));
router.put("/orders/:id/status", wrapAsync(adminController.updateOrderStatus));
router.post("/orders/:id/cancel", wrapAsync(adminController.cancelOrder));

// Users
router.get("/users", wrapAsync(adminController.getAllUsers));
router.put("/users/:id/role", wrapAsync(adminController.updateUserRole));

module.exports = router;
