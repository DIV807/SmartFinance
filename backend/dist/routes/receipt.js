import { Router } from "express";
import multer from "multer";
import fs from "fs";
import { aiParseReceipt } from "../utils/aiParseReceipt.js";
const router = Router();
const upload = multer({ dest: "tmp/" });
const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL || "http://localhost:5001";
router.post("/scan", upload.single("receipt"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded to backend" });
        }
        const buffer = fs.readFileSync(req.file.path);
        const form = new FormData();
        const blob = new Blob([buffer], { type: req.file.mimetype });
        form.append("receipt", blob, req.file.originalname);
        const ocrUrl = `${OCR_SERVICE_URL.replace(/\/+$/, "")}/scan`;
        const ocrRes = await fetch(ocrUrl, {
            method: "POST",
            body: form,
        });
        const data = await ocrRes.json().catch(() => ({}));
        fs.unlinkSync(req.file.path);
        if (!ocrRes.ok || !data.success) {
            console.error("OCR service error", {
                status: ocrRes.status,
                statusText: ocrRes.statusText,
                body: data,
                ocrUrl,
            });
            return res.status(500).json({ error: data.error || "OCR failed" });
        }
        let parsed;
        try {
            parsed = await aiParseReceipt(data.text);
        }
        catch (err) {
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
    }
    catch (err) {
        console.error("BACKEND OCR ERROR:", err);
        res.status(500).json({ error: "Receipt scan failed" });
    }
});
export default router;
