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

    // Use native fetch + FormData only if available; otherwise send the image path to the OCR microservice
    const form = new FormData();
    const blob = new Blob([buffer], { type: req.file.mimetype });
    form.append("receipt", blob, req.file.originalname);

    const ocrRes = await fetch("http://localhost:5001/scan", {
      method: "POST",
      body: form as any,
    });

    const data = await ocrRes.json();

    fs.unlinkSync(req.file.path);

    if (!data.success) {
      return res.status(500).json({ error: "OCR failed" });
    }

    let parsed;
    try {
      parsed = await aiParseReceipt(data.text);
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
      rawText: data.text,
      draftExpense: parsed,
    });

  } catch (err) {
    console.error("BACKEND OCR ERROR:", err);
    res.status(500).json({ error: "Receipt scan failed" });
  }
  }
);

export default router;
