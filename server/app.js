// server/app.js
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const userRoutes = require("./routes/user.js");
const foodRoutes = require("./routes/foodRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const { globalApiLimiter } = require("./middleware/rateLimiter");

const app = express();

// Trust proxy to fix X-Forwarded-For header issues with rate limiting
app.set("trust proxy", 1);

const connectDB = require("./utils/db");

// Helmet sets secure response headers (CSP, HSTS, X-Frame-Options, etc.)
app.use(helmet());

// CORS must come before session/passport so preflight OPTIONS is handled first
app.use(cors({
  origin: (origin, callback) => {
    const allowed = process.env.CLIENT_URL || "http://localhost:5173";
    // Allow same-origin requests (no Origin header) and the configured client URL
    if (!origin || origin === allowed) return callback(null, true);
    // In dev, allow any localhost port so the SSE direct connection works
    if (process.env.NODE_ENV !== "production" && /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    callback(new Error("CORS: origin not allowed"));
  },
  credentials: true,
}));

// Body parsers before session so req.body is always populated when needed
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

const store = MongoStore.create({
  mongoUrl: process.env.MONGO_URL,
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("Error in mongo session store");
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
};

app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy({ usernameField: "email" }, User.authenticate())
);
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Rate limiting
app.use("/api", globalApiLimiter);

// Routes
app.use("/", userRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/admin", adminRoutes);

// Error handling
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Endpoint not found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500 } = err;
  if (res.headersSent) return next(err);
  res.status(statusCode).json({ error: err.message || "Something went wrong" });
});

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
