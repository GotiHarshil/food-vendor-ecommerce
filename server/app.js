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

// EJS layout engine (allows layout("layouts/boilerplate") calls)
const ejsMate = require("ejs-mate");

const userRoutes = require("./routes/user.js");
const foodRoutes = require("./routes/foodRoutes.js");

const app = express();

// DB connection helper
const connectDB = require("./utils/db");

// View engine setup
app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
// allow Express to resolve views from both server/views and client/views
app.set("views", [
  // path.join(__dirname, "views"),
  path.join(__dirname, "..", "client", "views"),
]);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const store = MongoStore.create({
  mongoUrl: process.env.MONGO_URL,
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
  touchAfter: 24 * 3600, // time period in seconds
});

store.on("error", () => {
  console.log("Error in mongo session store");
});

const sessionOptions = {
  store: store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  store,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// Use email as the username field for passport-local since the login form
// posts `email` (not `username`). This prevents "Missing credentials" errors.
passport.use(
  new LocalStrategy({ usernameField: "email" }, User.authenticate())
);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware
app.use(cors());
app.use(express.json());

// Note: urlencoded and static middleware already registered above.

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  // expose current path to views so nav can mark the active link
  res.locals.currentPath = req.path;
  res.locals.currentUrl = req.originalUrl;
  next();
});

// API routes
app.use("/", userRoutes);
app.use("/api/food", foodRoutes);

app.all("*", (req, res) => {
  throw new ExpressError(404, "page not found");
});

// Error handling (simple for now)
app.use((err, req, res, next) => {
  let { statusCode = 500 } = err;

  if (res.headersSent) {
    return next(err);
  }

  res.status(statusCode).render("error", { err });
});

// Start server after DB connects
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
