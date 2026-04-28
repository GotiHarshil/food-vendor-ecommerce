const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
  },
  role: {
    type: String,
    enum: ["customer", "admin"],
    default: "customer",
  },
}, { timestamps: true });

// Configure passport-local-mongoose to use the `email` field as the username
userSchema.plugin(passportLocalMongoose, { usernameField: "email" });

module.exports = mongoose.model("User", userSchema);
