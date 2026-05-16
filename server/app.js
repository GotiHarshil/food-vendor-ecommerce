// server/app.js
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const cors = require("cors");
const path = require("path");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const ejsMate = require("ejs-mate");

const userRoutes = require("./routes/user.js");
const foodRoutes = require("./routes/foodRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");

const app = express();

const connectDB = require("./utils/db");

// CORS must come first so preflight OPTIONS requests are handled before session/passport
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

// View engine setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", [path.join(__dirname, "..", "client", "views")]);
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

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
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy({ usernameField: "email" }, User.authenticate())
);
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  res.locals.currentPath = req.path;
  res.locals.currentUrl = req.originalUrl;
  next();
});

// Routes
app.use("/", userRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/admin", adminRoutes);

// Error handling
app.all("*", (req, res, next) => {
  // For API requests return JSON 404
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Endpoint not found" });
  }
  next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500 } = err;
  if (res.headersSent) return next(err);

  // For API requests, return JSON errors
  if (req.path.startsWith("/api/") || req.headers["x-requested-with"] === "XMLHttpRequest") {
    return res.status(statusCode).json({ error: err.message || "Something went wrong" });
  }

  res.status(statusCode).render("error", { err });
});

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
