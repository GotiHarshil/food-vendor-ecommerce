// microservices/order-service/app.js
// Defines and exports the Express app only — no DB connect, no listen().
// index.js does the real boot; tests require this file directly with Supertest.
const express = require("express");
const cors = require("cors");

const orderRoutes = require("./routes/orders");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/orders", orderRoutes);

app.get("/health", (req, res) => res.json({ status: "Order Service running" }));

module.exports = app;
