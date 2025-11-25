// server/controllers/foodController.js
const Food = require("../models/Food");

// GET /api/food
async function getFoods(req, res, next) {
  try {
    const foods = await Food.find({});
    res.json(foods);
  } catch (err) {
    next(err);
  }
}

// GET /api/food/:id
async function getFoodById(req, res, next) {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ message: "Food not found" });
    res.json(food);
  } catch (err) {
    next(err);
  }
}

// POST /api/food
async function createFood(req, res, next) {
  try {
    const food = new Food(req.body);
    await food.save();
    res.status(201).json(food);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getFoods,
  getFoodById,
  createFood
};
