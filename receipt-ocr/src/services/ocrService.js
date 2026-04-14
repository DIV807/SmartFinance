const vision = require("@google-cloud/vision");
const { logger } = require("../utils/logger");

function hasGoogleCredentialsConfigured() {
  const p = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  return typeof p === "string" && p.trim().length > 0;
}

async function performGoogleVisionOcr(imagePath) {
  const client = new vision.ImageAnnotatorClient();

  // Perform text detection on the local file
  const [result] = await client.textDetection(imagePath);

  // The first element of textAnnotations contains the full extracted string
  const detections = result?.textAnnotations || [];
  return detections.length > 0 ? detections[0].description : "";
}

async function performOcr(imagePath) {
  const start = Date.now();
  logger.info(`Starting Google Cloud Vision OCR`, { imagePath });
  
  try {
    if (!hasGoogleCredentialsConfigured()) {
      const err = new Error(
        "GOOGLE_APPLICATION_CREDENTIALS is not set. Configure a service account JSON and set GOOGLE_APPLICATION_CREDENTIALS to its path."
      );
      err.code = "MISSING_GOOGLE_APPLICATION_CREDENTIALS";
      throw err;
    }

    const extractedText = await performGoogleVisionOcr(imagePath);

    const durationMs = Date.now() - start;
    logger.info(`Google OCR completed`, {
      imagePath,
      durationMs,
      textLength: extractedText.length,
    });

    return extractedText;
  } catch (err) {
    logger.error("Google Cloud Vision OCR failed", err);
    throw err;
  }
}

module.exports = { performOcr };
