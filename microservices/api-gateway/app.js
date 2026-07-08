// microservices/api-gateway/app.js
// Defines and exports the Express app only — no listen(). Proxy targets are
// read from process.env at middleware-construction time, so whoever requires
// this file must set AUTH_SERVICE_URL / ORDER_SERVICE_URL / TRANSLATION_SERVICE_URL
// first (index.js loads them from .env; tests set them directly).
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const app = express();

app.use(cors());

app.get("/health", (req, res) =>
  res.json({
    status: "API Gateway running",
    services: {
      auth: process.env.AUTH_SERVICE_URL,
      orders: process.env.ORDER_SERVICE_URL,
      translation: process.env.TRANSLATION_SERVICE_URL,
    },
  })
);

app.use(
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    pathFilter: "/auth",
  })
);

app.use(
  createProxyMiddleware({
    target: process.env.ORDER_SERVICE_URL,
    changeOrigin: true,
    pathFilter: "/orders",
  })
);

app.use(
  createProxyMiddleware({
    target: process.env.TRANSLATION_SERVICE_URL,
    changeOrigin: true,
    pathFilter: "/translate",
  })
);

module.exports = app;
