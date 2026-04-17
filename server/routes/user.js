const express = require("express");
const router = express.Router({ mergeParams: true });
// const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

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
  .post(wrapAsync(userController.signup));

router
  .route("/api/user/signup")
  //API JSON endpoint for signup
  .post(wrapAsync(userController.signupAPI));

router
  .route("/login")
  //Render login page
  .get(userController.renderLoginForm)
  //Login user
  .post(
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
  .post(wrapAsync(userController.loginAPI));

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

module.exports = router;
