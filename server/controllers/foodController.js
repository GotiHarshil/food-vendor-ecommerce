// server/controllers/foodController.js
const Food = require("../models/Food");
const CartItem = require("../models/cartItem");

// helper
function getVisitorId(req) {
  return req.user ? String(req.user._id) : req.sessionID;
}

// GET /api/food/menu
module.exports.getFoods = async (req, res, next) => {
  const foods = await Food.find();
  const userId = getVisitorId(req);
  const cartItems = await CartItem.find({ userId });
  res.render("pages/menu", { foods, cartItems });
};

// GET /api/food/cart
module.exports.getCartItems = async (req, res, next) => {
  const userId = getVisitorId(req);
  const cartItems = await CartItem.find({ userId });
  res.render("pages/cart", { cartItems });
};

// POST /api/food/cart/add/:id
module.exports.addToCart = async (req, res, next) => {
  const userId = getVisitorId(req);
  const foodId = req.params.id;

  const food = await Food.findById(foodId);
  if (!food) return res.status(404).send("Item doesn't exist");

  let item = await CartItem.findOne({ userId, foodId });

  if (item) {
    item.qty += 1;
    await item.save();
  } else {
    await CartItem.create({
      userId,
      foodId,
      name: food.name,
      price: food.price,
      imageUrl: food.imageUrl,
      qty: 1,
    });
  }

  // For fetch() calls, just return 200
  if (req.headers["x-requested-with"] === "XMLHttpRequest") {
    return res.sendStatus(200);
  }

  // For normal form posts, go back to menu
  res.redirect("/api/food/menu");
};

// POST /api/food/cart/update/:id
module.exports.updateCart = async (req, res) => {
  const userId = req.user ? req.user._id : req.sessionID;
  const foodId = req.params.id;
  const action = req.body.action;

  let item = await CartItem.findOne({ userId, foodId });

  if (!item) return res.redirect("back");

  if (action === "inc") {
    item.qty++;
  } 

  else if (action === "dec") {
    item.qty--;

    // IF QTY DROPS TO ZERO → DELETE ITEM
    if (item.qty <= 0) {
      await CartItem.deleteOne({ userId, foodId });
      return res.redirect("back");
    }
  }

  await item.save();
  return res.redirect("back");
};
