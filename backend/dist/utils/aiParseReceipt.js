export async function aiParseReceipt(text) {
    // Use OLLAMA_URL from env (set by k8s configmap to http://host.docker.internal:11434)
    const OLLAMA_BASE = (process.env.OLLAMA_URL || "http://host.docker.internal:11434").replace(/\/+$/, "");
    const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";
    const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: OLLAMA_MODEL,
            stream: false,
            messages: [
                {
                    role: "system",
                    content: "You extract structured expense data from OCR text. Always respond with raw JSON only, no markdown."
                },
                {
                    role: "user",
                    content: `From the receipt text below, extract:\n- amount (number, total paid - use the largest total)\n- description (merchant name or receipt title)\n- category (Food, Travel, Shopping, Bills, Groceries, Others)\n- date (YYYY-MM-DD or null)\n\nReceipt text:\n"""\n${text}\n"""\n\nReturn ONLY a valid JSON object. No explanation, no markdown code blocks.`
                }
            ],
            options: {
                temperature: 0
            }
        })
    });
    const data = await res.json();
    const content = data.message?.content;
    if (!content) {
        console.error("OLLAMA RAW RESPONSE:", JSON.stringify(data));
        throw new Error("No AI response from Ollama");
    }
    // Strip markdown code fences if Ollama wraps output in ```json ... ```
    const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    return JSON.parse(cleaned);
}
