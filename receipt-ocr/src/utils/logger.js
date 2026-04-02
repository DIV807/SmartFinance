const levels = ["debug", "info", "warn", "error"];

const levelWeights = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const LOG_LEVEL =
  process.env.LOG_LEVEL && levels.includes(process.env.LOG_LEVEL.toLowerCase())
    ? process.env.LOG_LEVEL.toLowerCase()
    : "info";

function shouldLog(level) {
  return levelWeights[level] >= levelWeights[LOG_LEVEL];
}

function formatMessage(level, message) {
  const ts = new Date().toISOString();
  return `[${ts}] [${level.toUpperCase()}] ${message}`;
}

function log(level, message, meta) {
  if (!shouldLog(level)) return;

  const base = formatMessage(level, message);

  if (meta instanceof Error) {
    // eslint-disable-next-line no-console
    console.error(`${base} - ${meta.stack || meta.message}`);
    return;
  }

  if (meta !== undefined) {
    // eslint-disable-next-line no-console
    console.log(base, meta);
    return;
  }

  // eslint-disable-next-line no-console
  console.log(base);
}

const logger = {
  debug: (msg, meta) => log("debug", msg, meta),
  info: (msg, meta) => log("info", msg, meta),
  warn: (msg, meta) => log("warn", msg, meta),
  error: (msg, meta) => log("error", msg, meta),
};

module.exports = { logger };

