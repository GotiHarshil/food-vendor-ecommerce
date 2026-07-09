const mongoose = require("mongoose");
const { hashPassword, verifyPasswordHash } = require("../utils/passwordHashing");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String },
    password: { type: String, required: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    phone: { type: String, default: "" },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
    passwordChangedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Hash password before saving (argon2id + HMAC pepper, see utils/passwordHashing.js)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await hashPassword(this.password);
  next();
});

// Compare password
userSchema.methods.comparePassword = function (candidatePassword) {
  return verifyPasswordHash(this.password, candidatePassword);
};

module.exports = mongoose.model("User", userSchema);
