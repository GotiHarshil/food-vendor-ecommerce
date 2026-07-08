require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 4002;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Order Service: MongoDB connected");
    app.listen(PORT, () => console.log(`Order Service running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
