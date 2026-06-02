import { ApiError } from "../lib/apiError.js";
import { authenticateUser, countUsers, getCurrentUserById, registerUser } from "../services/authService.js";

function parseRole(value, fallback) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  if (![1, 2].includes(parsed)) {
    throw new ApiError(400, "Invalid role. Use 1 for admin or 2 for employee.");
  }

  return parsed;
}

function validateLoginPayload(payload) {
  if (!payload?.email?.trim()) {
    throw new ApiError(400, "Email is required.");
  }

  if (!payload?.password) {
    throw new ApiError(400, "Password is required.");
  }

  return {
    email: payload.email.trim(),
    password: String(payload.password)
  };
}

async function validateRegisterPayload(payload, bootstrapMode) {
  if (!payload?.name?.trim()) {
    throw new ApiError(400, "Name is required.");
  }

  if (!payload?.email?.trim()) {
    throw new ApiError(400, "Email is required.");
  }

  if (!payload?.password) {
    throw new ApiError(400, "Password is required.");
  }

  if (String(payload.password).length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters long.");
  }

  return {
    name: payload.name.trim(),
    email: payload.email.trim(),
    password: String(payload.password),
    role: parseRole(payload.role, bootstrapMode ? 1 : 2)
  };
}

export async function postLogin(req, res) {
  const auth = await authenticateUser(validateLoginPayload(req.body));
  res.json({ data: auth });
}

export async function postRegister(req, res) {
  const totalUsers = await countUsers();
  const bootstrapMode = totalUsers === 0;

  if (!bootstrapMode && !req.user) {
    throw new ApiError(401, "Authentication required to register new users.");
  }

  if (!bootstrapMode && req.user.role !== 1) {
    throw new ApiError(403, "Only administrators can register new users.");
  }

  const user = await registerUser(await validateRegisterPayload(req.body, bootstrapMode));
  res.status(201).json({ data: user });
}

export async function getMe(req, res) {
  const user = await getCurrentUserById(req.user.userId);
  res.json({ data: user });
}
