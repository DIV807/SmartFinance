const app = require("./app");
const { logger } = require("./utils/logger");

const PORT = Number(process.env.PORT || 5001);

const server = app.listen(PORT, () => {
  logger.info(`OCR service listening on port ${PORT}`);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", reason);
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception", err);
  server.close(() => {
    process.exit(1);
  });
});

