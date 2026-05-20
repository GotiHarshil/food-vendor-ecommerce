const User = require("../models/user");
const passport = require("passport");

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup");
};

module.exports.renderHomePage = (req, res) => {
  // console.log("Rendering home page");
  // provide default nav links and cartCount so includes/navbar.ejs can render safely
  const navLinks = [{ href: "/", label: "Home" }];
  res.render("pages/home", { navLinks, cartCount: 0 });
};

module.exports.signup = async (req, res, next) => {
  console.log("check");
  try {
    let { username, email, password } = req.body;
    // Save the full name into `name` field; passport-local-mongoose is
    // configured to use `email` as the username field.
    const newUser = new User({ email, name: username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "You have successfully signed up and logged in");
      res.redirect("/");
    });
  } catch (e) {
    req.flash("error", e.message);
    return res.redirect("/signup");
  }
};

// API JSON endpoint for signup
module.exports.signupAPI = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Please provide all fields" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Create new user
    const newUser = new User({ email, name: username });
    const registeredUser = await User.register(newUser, password);

    // Login the user
    req.login(registeredUser, (err) => {
      if (err) {
        console.error("req.login error (signup):", err);
        return res.status(500).json({ error: "Login failed after signup" });
      }
      res.json({ success: true, message: "Account created successfully" });
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login");
};

module.exports.renderCartPage = (req, res) => {
  const cartItems = req.session.cart || [];
  res.render("pages/cart", { cartItems });
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back Foodie! You are logged in!");
  let redirectUrl = res.locals.redirectUrl || "/";
  res.redirect(redirectUrl);
};

// API JSON endpoint for login
module.exports.loginAPI = async (req, res, next) => {
  // Use passport authenticate middleware
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: "Authentication error" });
    }
    if (!user) {
      return res
        .status(401)
        .json({ error: info?.message || "Invalid credentials" });
    }

    req.login(user, (err) => {
      if (err) {
        console.error("req.login error:", err);
        return res.status(500).json({ error: "Login failed" });
      }
      res.json({ success: true, message: "Logged in successfully" });
    });
  })(req, res, next);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.flash("success", "You are logged out");
    res.redirect("/");
  });
};

// API JSON endpoint for logout
module.exports.logoutAPI = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ success: true, message: "Logged out successfully" });
  });
};

// API JSON endpoint to get user status
module.exports.getUserStatus = (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role || "customer",
      },
    });
  } else {
    res.status(401).json({ success: false, message: "Not logged in" });
  }
};

// Get user profile
module.exports.getProfile = async (req, res) => {
  res.json({
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone || "",
    role: req.user.role || "customer",
    createdAt: req.user.createdAt,
  });
};

// Update user profile
module.exports.updateProfile = async (req, res) => {
  const { name, phone } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Name cannot be empty" });
  }

  req.user.name = name.trim();
  req.user.phone = (phone || "").trim();
  await req.user.save();

  res.json({
    success: true,
    message: "Profile updated successfully",
    user: {
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
    },
  });
};

// Change password
module.exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Please provide both passwords" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters" });
  }

  try {
    await req.user.changePassword(currentPassword, newPassword);
    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    if (err.message === "Password incorrect") {
      return res.status(401).json({ error: "Current password is incorrect" });
    }
    res.status(500).json({ error: err.message || "Failed to change password" });
  }
};

// Get user favorites
module.exports.getFavorites = async (req, res) => {
  await req.user.populate("favorites");
  res.json(req.user.favorites || []);
};

// Toggle favorite
module.exports.toggleFavorite = async (req, res) => {
  const { foodId } = req.params;

  const idx = req.user.favorites.indexOf(foodId);
  if (idx === -1) {
    req.user.favorites.push(foodId);
  } else {
    req.user.favorites.splice(idx, 1);
  }

  await req.user.save();
  res.json({ success: true, favorited: idx === -1 });
};
