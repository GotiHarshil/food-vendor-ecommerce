const rateLimit = require("express-rate-limit");

const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
  skip: (req) => {
    // Skip admin API routes
    if (req.path.startsWith("/api/admin")) return true;
    // Skip admin logins
    if ((req.path === "/login" || req.path === "/api/user/login") && req.method === "POST") return true;
    // Skip if user is authenticated and is admin
    if (req.user && req.user.role === "admin") return true;
    return false;
  },
});

// Rate limiter for regular user logins (10 attempts per 15 minutes) - skip for admins
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts, please try again in 15 minutes." },
  skip: (req) => {
    // Skip if user is authenticated and is admin
    if (req.user && req.user.role === "admin") return true;
    return false;
  },
});

// No rate limiting for admin logins - pass through immediately
const adminLoginBypass = (req, res, next) => {
  next();
};

const checkoutLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many orders placed. Please wait before trying again." },
});

module.exports = { globalApiLimiter, authLimiter, adminLoginBypass, checkoutLimiter };
