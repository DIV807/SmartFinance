const Tesseract = require("tesseract.js");
const { logger } = require("../utils/logger");

async function performOcr(imagePath) {
  const start = Date.now();
  logger.info(`Starting OCR`, { imagePath });

  try {
    const result = await Tesseract.recognize(imagePath, "eng", {
      logger: (m) => {
        if (!m) return;
        const status = m.status || "progress";
        const progress =
          typeof m.progress === "number"
            ? `${Math.round(m.progress * 100)}%`
            : undefined;

        logger.debug(`Tesseract status: ${status}`, { progress });
      },
    });

    const durationMs = Date.now() - start;
    logger.info(`OCR completed`, {
      imagePath,
      durationMs,
      textLength: result?.data?.text?.length ?? 0,
    });

    return result.data.text;
  } catch (err) {
    logger.error("Tesseract OCR failed", err);
    throw err;
  }
}

module.exports = { performOcr };

