import { logger } from "../lib/logger.js";

export function requestLogger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    logger.info("HTTP request completed", {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
      ip: req.ip
    });
  });

  next();
}
