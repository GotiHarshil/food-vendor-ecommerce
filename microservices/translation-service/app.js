// microservices/translation-service/app.js
// Defines and exports the Express app only — no listen(). No DB here at all.
// index.js does the real boot; tests require this file directly with Supertest.
const express = require("express");
const cors = require("cors");

const translateRoutes = require("./routes/translate");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/translate", translateRoutes);

app.get("/health", (req, res) => res.json({ status: "Translation Service running" }));

module.exports = app;
