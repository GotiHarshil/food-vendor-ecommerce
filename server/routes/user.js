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
  .get(userController.renderHomePage)
  // //Add user
  // .post(wrapAsync(userController.signup));

router
  .route("/signup")
  //Render signup
  .get(userController.renderSignupForm)
  //Add user
  .post(wrapAsync(userController.signup));

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
  .route("/logout")
  //Logout
  .get(userController.logout);

module.exports = router;
