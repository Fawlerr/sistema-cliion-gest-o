import { ApiError } from "./apiError.js";

export function parseIdParam(value, label = "id") {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ApiError(400, `Invalid ${label}. Expected a positive integer.`);
  }

  return parsed;
}

export function parseOptionalInteger(value, { min, max, fallback, label }) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed)) {
    throw new ApiError(400, `Invalid ${label}. Expected an integer.`);
  }

  if (min !== undefined && parsed < min) {
    throw new ApiError(400, `${label} must be greater than or equal to ${min}.`);
  }

  if (max !== undefined && parsed > max) {
    throw new ApiError(400, `${label} must be less than or equal to ${max}.`);
  }

  return parsed;
}

export function parseOptionalDate(value, label) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new ApiError(400, `Invalid ${label}. Expected an ISO date.`);
  }

  return parsed.toISOString().slice(0, 10);
}
