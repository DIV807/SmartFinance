const NUM_REGEX = /[-+]?[\d.,]+/g;

function normalizeText(raw) {
  if (!raw) return "";
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function extractLines(rawText) {
  const normalized = normalizeText(rawText);
  return normalized
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

function parseNumber(str) {
  if (!str) return null;
  const cleaned = str.replace(/[^0-9.,-]+/g, "");
  if (!cleaned) return null;

  const hasComma = cleaned.includes(",");
  const hasDot = cleaned.includes(".");

  let normalized = cleaned;

  if (hasComma && hasDot) {
    normalized = cleaned.replace(/,/g, "");
  } else if (hasComma && !hasDot) {
    normalized = cleaned.replace(/,/g, ".");
  }

  const num = Number(normalized);
  if (Number.isNaN(num)) return null;
  return num;
}

function findCandidateNumbers(lines) {
  const candidates = [];

  lines.forEach((line, lineIndex) => {
    const matches = line.match(NUM_REGEX);
    if (!matches) return;

    matches.forEach((m) => {
      const value = parseNumber(m);
      if (value == null) return;
      candidates.push({ value, line, lineIndex, raw: m });
    });
  });

  return candidates;
}

function detectDate(lines) {
  const datePatterns = [
    /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/, 
    /\b(\d{4}[/-]\d{1,2}[/-]\d{1,2})\b/, 
  ];

  for (const line of lines) {
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        return match[1];
      }
    }
  }

  return null;
}

function detectMerchantName(lines) {
  if (!lines.length) return null;

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (
      /total|amount|tax|invoice|receipt|change|balance|subtotal/.test(lower)
    ) {
      continue;
    }
    if (/\d{2,}/.test(line)) {
      continue;
    }
    if (/[a-zA-Z]/.test(line)) {
      return line;
    }
  }

  return lines[0];
}

function detectTotalAmount(lines, candidates) {
  if (!candidates.length) return null;

  const keywordPattern = /(grand\s*total|total\s*amount|total|amount\s*due|balance\s*due)/i;
  const keywordLines = candidates.filter((c) => keywordPattern.test(c.line));

  if (keywordLines.length) {
    const best = keywordLines.reduce((a, b) =>
      b.value >= a.value ? b : a
    );
    return best.value;
  }

  const largest = candidates.reduce((a, b) => (b.value >= a.value ? b : a));
  return largest.value;
}

function extractItems(lines, candidates, totalAmount) {
  if (!candidates.length) return [];

  const totalLines = new Set(
    candidates
      .filter((c) =>
        /(grand\s*total|total\s*amount|total|amount\s*due|balance\s*due)/i.test(
          c.line
        )
      )
      .map((c) => c.lineIndex)
  );

  const itemCandidates = candidates.filter((c) => !totalLines.has(c.lineIndex));

  const items = [];
  const usedLineIndexes = new Set();

  itemCandidates.forEach((c) => {
    if (usedLineIndexes.has(c.lineIndex)) return;

    const line = lines[c.lineIndex];
    const lower = line.toLowerCase();

    if (/subtotal|change|balance/i.test(lower)) return;

    const namePart = line
      .replace(c.raw, "")
      .replace(/[:\-]+$/, "")
      .trim();

    const name =
      namePart ||
      line.replace(/[-+]?[\d.,]+/g, "").replace(/[:\-]+$/, "").trim();

    if (!name) return;

    items.push({
      name,
      price: c.value,
    });

    usedLineIndexes.add(c.lineIndex);
  });

  if (totalAmount != null && totalAmount > 0) {
    const sum = items.reduce((acc, it) => acc + (it.price || 0), 0);
    if (sum > totalAmount * 1.2 || sum < totalAmount * 0.5) {
      return items;
    }
  }

  return items;
}

function parseReceiptText(rawText) {
  const lines = extractLines(rawText);

  const merchantName = detectMerchantName(lines);
  const date = detectDate(lines);

  const numberCandidates = findCandidateNumbers(lines);
  const totalAmount = detectTotalAmount(lines, numberCandidates);
  const items = extractItems(lines, numberCandidates, totalAmount);

  return {
    merchantName: merchantName || null,
    date: date || null,
    totalAmount: totalAmount != null ? totalAmount : null,
    items,
  };
}

module.exports = { parseReceiptText };

