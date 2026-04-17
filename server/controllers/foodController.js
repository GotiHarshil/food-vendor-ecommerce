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

  // Return JSON for API requests
  if (
    req.headers["x-requested-with"] === "XMLHttpRequest" ||
    req.accepts("json")
  ) {
    return res.json(foods);
  }

  // Otherwise render EJS for browser requests
  const userId = getVisitorId(req);
  const cartItems = await CartItem.find({ userId });
  res.render("pages/menu", { foods, cartItems });
};

// GET /api/food/cart
module.exports.getCartItems = async (req, res, next) => {
  const userId = getVisitorId(req);
  const cartItems = await CartItem.find({ userId }).populate("foodId");

  // Return JSON for API requests
  if (
    req.headers["x-requested-with"] === "XMLHttpRequest" ||
    req.accepts("json")
  ) {
    // Transform to include all necessary fields
    const transformed = cartItems.map((item) => ({
      _id: item._id,
      foodId: item.foodId._id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      qty: item.qty,
    }));
    return res.json(transformed);
  }

  // Otherwise render EJS
  res.render("pages/cart", { cartItems });
};

// POST /api/food/cart/add/:id
module.exports.addToCart = async (req, res, next) => {
  const userId = getVisitorId(req);
  const foodId = req.params.id;

  const food = await Food.findById(foodId);
  if (!food) return res.status(404).json({ error: "Item doesn't exist" });

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
  const userId = req.user ? String(req.user._id) : req.sessionID;
  const foodId = req.params.id;
  const action = req.body.action;
  const qty = req.body.qty;

  let item = await CartItem.findOne({ userId, foodId });

  if (!item) {
    if (req.headers["x-requested-with"] === "XMLHttpRequest") {
      return res.status(404).json({ error: "Item not in cart" });
    }
    return res.redirect("back");
  }

  if (action === "inc") {
    item.qty++;
  } else if (action === "dec") {
    item.qty--;

    // IF QTY DROPS TO ZERO → DELETE ITEM
    if (item.qty <= 0) {
      await CartItem.deleteOne({ userId, foodId });
      if (req.headers["x-requested-with"] === "XMLHttpRequest") {
        return res.json({ success: true, deleted: true });
      }
      return res.redirect("back");
    }
  } else if (action === "set" && qty) {
    const newQty = parseInt(qty);
    if (newQty <= 0) {
      await CartItem.deleteOne({ userId, foodId });
      if (req.headers["x-requested-with"] === "XMLHttpRequest") {
        return res.json({ success: true, deleted: true });
      }
      return res.redirect("back");
    }
    item.qty = newQty;
  }

  await item.save();

  if (req.headers["x-requested-with"] === "XMLHttpRequest") {
    return res.json({ success: true, qty: item.qty });
  }

  return res.redirect("back");
};
