import { Router, type Request, type Response } from "express";
import multer from "multer";
import fs from "fs";
import { aiParseReceipt } from "../utils/aiParseReceipt.js";

const router = Router();
const upload = multer({ dest: "tmp/" });

router.post(
  "/scan",
  upload.single("receipt"),
  async (req: Request & { file?: any }, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded to backend" });
    }

    const buffer = fs.readFileSync(req.file.path);
    const base64Image = buffer.toString("base64");
    const mimeType = req.file.mimetype;

    fs.unlinkSync(req.file.path);

    let parsed;
    try {
      parsed = await aiParseReceipt(base64Image, mimeType);
    } catch (err) {
      console.error("AI PARSE FAILED:", err);
      parsed = {
        amount: null,
        description: "Receipt",
        category: "Others",
        date: null,
      };
    }

    res.json({
      success: true,
      rawText: "Gemini Vision Pipeline Complete.",
      draftExpense: parsed,
    });

  } catch (err) {
    console.error("BACKEND OCR ERROR:", err);
    res.status(500).json({ error: "Receipt scan failed" });
  }
  }
);

export default router;
