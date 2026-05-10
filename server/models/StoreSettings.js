// server/models/StoreSettings.js
const mongoose = require("mongoose");

const storeSettingsSchema = new mongoose.Schema(
  {
    // Singleton — only one document should exist
    _id: { type: String, default: "store_settings" },
    isOpen: { type: Boolean, default: true },
    storeName: { type: String, default: "MANU" },
    storeAddress: { type: String, default: "42W 46th Street, NY 10036" },
    storePhone: { type: String, default: "" },
    storeEmail: { type: String, default: "maundabeli2708@gmail.com" },
    announcement: { type: String, default: "" }, // optional banner text
  },
  { timestamps: true }
);

// Ensure only one settings document ever exists
storeSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findById("store_settings");
  if (!settings) {
    settings = await this.create({ _id: "store_settings" });
  }
  return settings;
};

module.exports = mongoose.model("StoreSettings", storeSettingsSchema);
