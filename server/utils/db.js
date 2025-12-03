// server/utils/db.js
const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGO_URL;

async function connectDB() {
  
  try {
    await mongoose.connect(MONGO_URL);
    console.log("MongoDB connected");
    console.log("Connected to MongoDB:", mongoose.connection.name);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

module.exports = connectDB;
