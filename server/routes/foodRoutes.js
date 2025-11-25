// server/routes/foodRoutes.js
const express = require("express");
const router = express.Router();
const foodController = require("../controllers/foodController");

router.get("/", foodController.getFoods);
router.get("/:id", foodController.getFoodById);
router.post("/", foodController.createFood);

module.exports = router;
