const express = require("express");
const ocrRouter = require("./routes/ocr");
const { logger } = require("./utils/logger");

const app = express();

app.use(express.json());

app.use("/", ocrRouter);

// Fallback 404 handler
app.use((req, res) => {
  logger.warn("Route not found", { method: req.method, url: req.originalUrl });
  res.status(404).json({ success: false, error: "Not found" });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  logger.error("Unhandled application error", err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

module.exports = app;

