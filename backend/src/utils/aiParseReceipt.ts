export async function aiParseReceipt(text: string) {
  const res = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "mistral",
      stream: false, // 🔥 THIS IS THE FIX
      messages: [
        {
          role: "system",
          content: "You extract structured expense data from OCR text."
        },
        {
          role: "user",
          content: `
From the receipt text below, extract:
- amount (number, total paid – use the largest total)
- description (merchant name or receipt title)
- category (Food, Travel, Shopping, Bills, Groceries, Others)
- date (YYYY-MM-DD or null)

Receipt text:
"""
${text}
"""

Return ONLY valid JSON. No explanation.
`
        }
      ],
      options: {
        temperature: 0
      }
    })
  });

  const data = await res.json();

  // ✅ Correct place to read content when stream=false
  const content = data.message?.content;

  if (!content) {
    console.error("OLLAMA RAW RESPONSE:", data);
    throw new Error("No AI response");
  }

  return JSON.parse(content);
}
