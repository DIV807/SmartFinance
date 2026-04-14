export async function aiParseReceipt(base64Image: string, mimeType: string) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing from environment secrets.");
  }

  const payload = {
    contents: [
      {
        parts: [
          { text: "You extract structured expense data from OCR receipt images. Always respond with raw JSON only, no markdown." },
          { text: `From the attached receipt image, extract:
- amount (number, total paid - use the largest total)
- description (merchant name or receipt title)
- category (Food, Travel, Shopping, Bills, Groceries, Others)
- date (YYYY-MM-DD or null)

Return ONLY a valid JSON object. No explanation, no markdown code blocks.` },
          { inlineData: { mimeType: mimeType, data: base64Image } }
        ]
      }
    ],
    generationConfig: {
      temperature: 0,
      responseMimeType: "application/json"
    }
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  
  if (!res.ok) {
    console.error("GEMINI API ERROR:", JSON.stringify(data));
    throw new Error(`Gemini API failed: ${data.error?.message || res.status}`);
  }

  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    console.error("GEMINI RAW RESPONSE:", JSON.stringify(data));
    throw new Error("No AI response from Gemini");
  }

  // Strip markdown code fences if Gemini wraps output in ```json ... ```
  const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  return JSON.parse(cleaned);
}
