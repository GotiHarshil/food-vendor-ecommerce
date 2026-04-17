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
  const deliveryFee = 5.0; // default
  res.render("pages/cart", { cartItems, deliveryFee });
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
      },
    });
  } else {
    res.status(401).json({ success: false, message: "Not logged in" });
  }
};
