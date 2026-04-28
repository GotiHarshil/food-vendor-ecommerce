const ExpressError = require("./utils/ExpressError.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // For API requests, return JSON
    if (req.headers["x-requested-with"] === "XMLHttpRequest" || req.accepts("json")) {
      return res.status(401).json({ error: "Please log in first" });
    }
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "Kindly login first!");
    return res.redirect("/login");
  }
  next();
};

module.exports.isAdmin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Please log in first" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};
