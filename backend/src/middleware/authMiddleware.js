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


export const authorizeRoles = (...allowedRoles) => {
  // O .flat() garante que, seja array ou não, tudo vire uma lista simples
  const roles = allowedRoles.flat();

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Acesso negado. Usuário ou permissão não identificados.' });
    }

    // O nosso dicionário de cargos!
    const roleMap = {
      1: 'ADMIN',
      2: 'EMPLOYEE', // ou outro nome que o seu sistema usar para a role 2
    };

    // Traduz o número (1) para o texto ('ADMIN')
    const userRoleString = roleMap[req.user.role] || req.user.role;

    // Se a lista não tiver o número 1 E não tiver a palavra 'ADMIN', bloqueia!
    if (!roles.includes(req.user.role) && !roles.includes(userRoleString)) {
      return res.status(403).json({ error: 'Acesso negado. Você não tem permissão para esta ação.' });
    }

    // Se chegou aqui, a catraca abre!
    next();
  };
};