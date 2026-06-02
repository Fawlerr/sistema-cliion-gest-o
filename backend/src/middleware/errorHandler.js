import { ApiError } from "../lib/apiError.js";
import { logger } from "../lib/logger.js";

export function errorHandler(error, req, res, _next) {
  const statusCode = error instanceof ApiError ? error.statusCode : error.statusCode || 500;
  const message = error instanceof ApiError ? error.message : statusCode < 500 ? error.message : "Internal server error.";

  logger.error("Request failed", {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    message: error.message,
    stack: error.stack,
    details: error instanceof ApiError ? error.details : undefined
  });

  res.status(statusCode).json({
    error: {
      message,
      details: error instanceof ApiError ? error.details : undefined,
      requestId: req.headers["x-request-id"] || null
    }
  });
}
