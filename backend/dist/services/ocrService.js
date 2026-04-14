import { createWorker } from "tesseract.js";
export async function extractTextFromImage(imagePath) {
    const worker = await createWorker("eng");
    try {
        await worker.setParameters({
            tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:/-()#%&@*+ Rs$INR",
            tessedit_pageseg_mode: 6,
            tessedit_ocr_engine_mode: 3,
            preserve_interword_spaces: "1",
        });
        const { data } = await worker.recognize(imagePath);
        return {
            rawText: data.text || "",
            confidence: Number(data.confidence || 0),
        };
    }
    finally {
        await worker.terminate();
    }
}
