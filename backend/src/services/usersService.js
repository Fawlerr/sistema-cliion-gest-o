import { query } from "../db/pool.js";
import { ApiError } from "../lib/apiError.js";

const baseSelect = `
  SELECT
    id,
    name,
    email,
    role,
    created_at AS "createdAt"
  FROM users
`;

export async function listUsers() {
  const result = await query(`${baseSelect} ORDER BY created_at DESC, id DESC`);
  return result.rows;
}

export async function getUserById(id) {
  const result = await query(`${baseSelect} WHERE id = $1`, [id]);

  if (!result.rowCount) {
    throw new ApiError(404, "User not found.");
  }

  return result.rows[0];
}
