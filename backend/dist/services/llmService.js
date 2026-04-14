const DEFAULT_OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const DEFAULT_OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 20000);
function buildPrompt(ocrText) {
    return `You are an AI that extracts structured data from receipts.

Extract:
- merchant_name
- date
- total_amount
- items (name + price)
- payment_method

Rules:
- Return ONLY valid JSON
- Use INR currency format
- If data missing, return null
- Ensure numbers are numeric

Receipt text:
"""
${ocrText}
"""`;
}
function safeJsonParse(content) {
    const trimmed = content.trim();
    const jsonStart = trimmed.indexOf("{");
    const jsonEnd = trimmed.lastIndexOf("}");
    const jsonCandidate = jsonStart >= 0 && jsonEnd >= jsonStart
        ? trimmed.slice(jsonStart, jsonEnd + 1)
        : trimmed;
    return JSON.parse(jsonCandidate);
}
export async function parseReceiptWithLlm(ocrText) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);
    try {
        const response = await fetch(`${DEFAULT_OLLAMA_URL}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: DEFAULT_OLLAMA_MODEL,
                prompt: buildPrompt(ocrText),
                stream: false,
                format: "json",
            }),
            signal: controller.signal,
        });
        if (!response.ok) {
            throw new Error(`Ollama API failed with status ${response.status}`);
        }
        const data = (await response.json());
        if (!data.response) {
            throw new Error("Ollama returned empty response");
        }
        return safeJsonParse(data.response);
    }
    finally {
        clearTimeout(timeout);
    }
}
