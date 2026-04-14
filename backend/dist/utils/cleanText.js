export function cleanReceiptText(input) {
    if (!input)
        return "";
    return input
        // Common OCR substitutions.
        .replace(/₹/g, "Rs.")
        .replace(/\bO(?=\d)/g, "0")
        .replace(/(?<=\d)O\b/g, "0")
        .replace(/\bl(?=\d)/g, "1")
        .replace(/(?<=\d)l\b/g, "1")
        // Normalize line endings/whitespace.
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}
