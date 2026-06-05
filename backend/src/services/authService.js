import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "../db/pool.js";
import { env } from "../config/env.js";
import { ApiError } from "../lib/apiError.js";

const saltRounds = 10;
const publicUserSelect = `
  SELECT
    id,
    name,
    email,
    role,
    "createdAt",
    "updatedAt"
  FROM users
`;

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function mapUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

function mapAuthUser(row) {
  if (!row) {
    return null;
  }

  return {
    ...mapUser(row),
    passwordHash: row.passwordHash
  };
}

export async function countUsers() {
  const result = await query(`SELECT COUNT(*)::int AS total FROM users`);
  return result.rows[0]?.total || 0;
}

export async function findUserByEmail(email) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return null;
  }

  const result = await query(`${publicUserSelect} WHERE LOWER(email) = $1 LIMIT 1`, [normalizedEmail]);
  return mapUser(result.rows[0]);
}

export async function findAuthUserByEmail(email) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return null;
  }

  const result = await query(
    `
      SELECT
        id,
        name,
        email,
        role,
        "passwordHash",
        "createdAt",
        "updatedAt"
      FROM users
      WHERE LOWER(email) = $1
      LIMIT 1
    `,
    [normalizedEmail]
  );

  return mapAuthUser(result.rows[0]);
}

export async function getCurrentUserById(userId) {
  const result = await query(`${publicUserSelect} WHERE id = $1`, [userId]);

  if (!result.rowCount) {
    throw new ApiError(401, "Authentication required.");
  }

  return mapUser(result.rows[0]);
}

export function signAuthToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role
    },
    env.auth.jwtSecret,
    {
      expiresIn: env.auth.jwtExpiresIn
    }
  );
}

export function verifyAuthToken(token) {
  try {
    return jwt.verify(token, env.auth.jwtSecret);
  } catch {
    throw new ApiError(401, "Invalid or expired token.");
  }
}

export async function registerUser({ name, email, password, role }) {
  const normalizedEmail = normalizeEmail(email);

  if (await findUserByEmail(normalizedEmail)) {
    throw new ApiError(409, "A user with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, saltRounds);
  const result = await query(
    `
      INSERT INTO users (name, email, "passwordHash", role, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING
        id,
        name,
        email,
        role,
        "createdAt",
        "updatedAt"
    `,
    [name.trim(), normalizedEmail, passwordHash, role]
  );

  return mapUser(result.rows[0]);
}

export async function authenticateUser({ email, password }) {
  const user = await findAuthUserByEmail(email);

  if (!user?.passwordHash) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password.");
  }

  return {
    token: signAuthToken(user),
    user: mapUser(user)
  };
}
