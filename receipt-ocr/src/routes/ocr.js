const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { performOcr } = require("../services/ocrService");
const { logger } = require("../utils/logger");
const { parseReceiptText } = require("../utils/receiptParser");

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
      return res.status(400).json({
        success: false,
        error: "No file received",
      });
    }

    tempFilePath = req.file.path;

    logger.info("Received receipt for OCR", {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: tempFilePath,
    });

    const text = await performOcr(tempFilePath);

    if (!text || !text.trim()) {
      logger.warn("OCR completed but no text extracted", { path: tempFilePath });
    }

    const parsedReceipt = parseReceiptText(text || "");

    logger.debug("Parsed receipt summary", {
      merchantName: parsedReceipt.merchantName,
      totalAmount: parsedReceipt.totalAmount,
      date: parsedReceipt.date,
      itemCount: parsedReceipt.items?.length ?? 0,
    });

    return res.json({
      success: true,
      rawText: text,
      parsedReceipt,
      text,
    });
  } catch (err) {
    logger.error("OCR route error", err);

    return res.status(500).json({
      success: false,
      error: "OCR failed",
    });
  } finally {
    if (tempFilePath) {
      fs.promises
        .unlink(tempFilePath)
        .then(() => {
          logger.debug("Temporary upload file deleted", { path: tempFilePath });
        })
        .catch((unlinkErr) => {
          logger.warn("Failed to delete temporary upload file", {
            path: tempFilePath,
            error: unlinkErr?.message,
          });
        });
    }
  }
});

module.exports = router;

