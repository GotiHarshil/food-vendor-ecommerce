const express = require("express");
const router = express.Router({ mergeParams: true });
// const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");
const { authLimiter, adminLoginBypass } = require("../middleware/rateLimiter");

const userController = require("../controllers/users.js");

router
  .route("/")
  //Render signup
  .get(userController.renderHomePage);
// //Add user
// .post(wrapAsync(userController.signup));

router
  .route("/signup")
  //Render signup
  .get(userController.renderSignupForm)
  //Add user
  .post(authLimiter, wrapAsync(userController.signup));

router
  .route("/api/user/signup")
  //API JSON endpoint for signup
  .post(authLimiter, wrapAsync(userController.signupAPI));

router
  .route("/login")
  //Render login page
  .get(userController.renderLoginForm)
  //Login user
  .post(
    adminLoginBypass,
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  );

router
  .route("/api/user/login")
  //API JSON endpoint for login
  .post(adminLoginBypass, wrapAsync(userController.loginAPI));

router
  .route("/cart")
  //Render signup
  .get(userController.renderCartPage);
//Add user
// .post(wrapAsync(userController.signup));

router
  .route("/logout")
  //Logout
  .get(userController.logout);

router
  .route("/api/user/logout")
  //API JSON endpoint for logout
  .post(userController.logoutAPI);

router
  .route("/api/user/status")
  //API JSON endpoint to check user login status
  .get(userController.getUserStatus);

router
  .route("/api/user/profile")
  //Get user profile
  .get(isLoggedIn, wrapAsync(userController.getProfile))
  //Update user profile
  .put(isLoggedIn, wrapAsync(userController.updateProfile));

router
  .route("/api/user/password")
  //Change password
  .put(isLoggedIn, wrapAsync(userController.changePassword));

router
  .route("/api/user/favorites")
  //Get user favorites
  .get(isLoggedIn, wrapAsync(userController.getFavorites));

router
  .route("/api/user/favorites/:foodId")
  //Toggle favorite
  .post(isLoggedIn, wrapAsync(userController.toggleFavorite));

router
  .route("/api/user/forgot-password")
  //Forgot password - send reset email
  .post(authLimiter, wrapAsync(userController.forgotPassword));

router
  .route("/api/user/reset-password")
  //Reset password - verify token and set new password
  .post(authLimiter, wrapAsync(userController.resetPassword));

module.exports = router;
