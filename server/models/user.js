const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { hashPassword, verifyPasswordHash } = require("../utils/passwordHashing");

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
  phone: {
    type: String,
    default: "",
  },
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
    },
  ],
  // Stores the argon2id-encoded hash (PHC string format, embeds its own salt
  // and cost params). Excluded from default query projections so it's never
  // accidentally serialized/logged; opt in explicitly with .select("+password").
  password: {
    type: String,
    required: true,
    select: false,
  },
  resetToken: {
    type: String,
    default: null,
  },
  resetTokenExpiry: {
    type: Date,
    default: null,
  },
  passwordChangedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

// Hashes and saves a new user's password. Mirrors passport-local-mongoose's
// old `User.register(doc, password)` shape (unsaved doc + plaintext in,
// saved doc out) so most call sites didn't need to change.
userSchema.statics.registerNewUser = async function (userDoc, plaintextPassword) {
  userDoc.password = await hashPassword(plaintextPassword);
  try {
    return await userDoc.save();
  } catch (err) {
    if (err.code === 11000) {
      throw new Error("Email already registered");
    }
    throw err;
  }
};

userSchema.methods.verifyPassword = async function (plaintextPassword) {
  let hash = this.password;
  if (hash === undefined) {
    // `password` has select:false — if this doc came from deserializeUser or
    // any other default-projection query, reload it explicitly.
    const withPassword = await this.constructor.findById(this._id).select("+password");
    if (!withPassword) return false;
    hash = withPassword.password;
  }
  return verifyPasswordHash(hash, plaintextPassword);
};

userSchema.methods.setPassword = async function (newPlaintextPassword) {
  this.password = await hashPassword(newPlaintextPassword);
  return this;
};

userSchema.methods.changePassword = async function (currentPlaintext, newPlaintext) {
  const ok = await this.verifyPassword(currentPlaintext);
  if (!ok) {
    throw new Error("Password incorrect");
  }
  await this.setPassword(newPlaintext);
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
