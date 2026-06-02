import { ApiError } from "../lib/apiError.js";
import { getCurrentUserById, verifyAuthToken } from "../services/authService.js";

function extractBearerToken(headerValue) {
  if (!headerValue) {
    return null;
  }

  const [scheme, token] = String(headerValue).split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new ApiError(401, "Invalid Authorization header.");
  }

  return token.trim();
}

async function resolveAuthenticatedUser(req, required) {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    if (required) {
      throw new ApiError(401, "Authentication required.");
    }

    req.user = null;
    return;
  }

  const payload = verifyAuthToken(token);
  const user = await getCurrentUserById(payload.userId);

  req.user = {
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email
  };
}

export async function authenticate(req, _res, next) {
  try {
    await resolveAuthenticatedUser(req, true);
    next();
  } catch (error) {
    next(error);
  }
}

export async function authenticateOptional(req, _res, next) {
  try {
    await resolveAuthenticatedUser(req, false);
    next();
  } catch (error) {
    next(error);
  }
}

export function authorizeRoles(allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      next(new ApiError(401, "Authentication required."));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new ApiError(403, "You do not have permission to access this resource."));
      return;
    }

    next();
  };
}
