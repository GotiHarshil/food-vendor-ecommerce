const User = require("../models/user");

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

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.flash("success", "You are logged out");
    res.redirect("/");
  });
};
