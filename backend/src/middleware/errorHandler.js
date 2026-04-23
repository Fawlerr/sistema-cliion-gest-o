import { ApiError } from "../lib/apiError.js";

export function errorHandler(error, _req, res, _next) {
  const statusCode = error instanceof ApiError ? error.statusCode : 500;
  const message = error instanceof ApiError ? error.message : "Internal server error.";

  if (!(error instanceof ApiError)) {
    console.error(error);
  }

  res.status(statusCode).json({
    error: {
      message,
      details: error instanceof ApiError ? error.details : undefined
    }
  });
}
