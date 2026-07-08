require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 4001;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Auth Service: MongoDB connected");
    app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
