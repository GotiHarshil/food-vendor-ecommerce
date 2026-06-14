const rateLimit = require("express-rate-limit");

const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
  skip: (req) => {
    // Skip admin API routes (admin has its own auth checks)
    if (req.path.startsWith("/api/admin")) return true;
    // Skip if user is authenticated and is admin
    if (req.user && req.user.role === "admin") return true;
    return false;
  },
});

// Rate limiter for auth endpoints: login, signup, forgot/reset password
// Admins bypass this so a locked-out admin can still log in from a known device,
// but only AFTER they are already authenticated (req.user is set by passport session).
// Unauthenticated login attempts are always subject to this limit.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts, please try again in 15 minutes." },
  skip: (req) => {
    // Already authenticated admins skip the limiter (e.g. re-authenticating)
    if (req.user && req.user.role === "admin") return true;
    return false;
  },
});

const checkoutLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many orders placed. Please wait before trying again." },
});

module.exports = { globalApiLimiter, authLimiter, checkoutLimiter };
