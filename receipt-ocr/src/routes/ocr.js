const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { performOcr } = require("../services/ocrService");
const { logger } = require("../utils/logger");

const router = express.Router();
const uploadsDir = path.join(__dirname, "..", "..", "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({ dest: uploadsDir });



router.get("/health", (_req, res) => {
  res.json({ ok: true });
});

router.post("/scan", upload.single("receipt"), async (req, res) => {
  let tempFilePath;

  try {
    if (!req.file) {
      logger.warn("No file received on /scan");
      return res.status(400).json({ success: false, error: "No file received" });
    }

    tempFilePath = req.file.path;

    logger.info("Received receipt for OCR AI Pipeline", {
      path: tempFilePath,
    });

    // START OF AI PIPELINE
    // 1. Send image to Google Cloud Vision API
    const rawText = await performOcr(tempFilePath);

    if (!rawText || !rawText.trim()) {
      logger.warn("Google Vision API completed but returned no text");
    }

    return res.json({
      success: true,
      rawText: rawText,
      text: rawText,
    });
  } catch (err) {
    logger.error("OCR Pipeline failed", err);

    return res.status(500).json({
      success: false,
      error: "Extraction Pipeline failed",
    });
  } finally {
    if (tempFilePath) {
      fs.promises.unlink(tempFilePath).catch(() => {});
    }
  }
});

module.exports = router;
