const express = require("express");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/scan", upload.single("receipt"), async (req, res) => {
  try {
    const imagePath = req.file.path;

    const result = await Tesseract.recognize(imagePath, "eng");
    fs.unlinkSync(imagePath);

    res.json({
      success: true,
      text: result.data.text
    });
  } catch (err) {
    res.status(500).json({ error: "OCR failed" });
  }
});

app.get("/health", (_, res) => res.send("OK"));

app.listen(5001, () => {
  console.log("OCR service running on port 5001");
});
