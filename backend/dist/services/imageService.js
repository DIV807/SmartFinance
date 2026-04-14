import sharp from "sharp";
export async function preprocessImage(inputPath) {
    const outputPath = `${inputPath}-processed.png`;
    // Improve contrast/noise for better OCR reliability.
    await sharp(inputPath)
        .rotate()
        .grayscale()
        .normalize()
        .threshold(170)
        .toFormat("png")
        .toFile(outputPath);
    return outputPath;
}
export function isLikelyImage(mimeType) {
    if (!mimeType)
        return false;
    return /^image\//.test(mimeType);
}
