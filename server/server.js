// server/server.js — real boot entrypoint (loads env, connects to Mongo, starts listening).
// app.js only defines the Express app; tests require app.js directly with Supertest
// and never go through this file.
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const app = require("./app");
const connectDB = require("./utils/db");

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
