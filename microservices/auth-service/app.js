// microservices/auth-service/app.js
// Defines and exports the Express app only — no DB connect, no listen().
// index.js does the real boot; tests require this file directly with Supertest.
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

app.get("/health", (req, res) => res.json({ status: "Auth Service running" }));

module.exports = app;
