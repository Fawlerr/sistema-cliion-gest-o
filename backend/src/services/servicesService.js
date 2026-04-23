import { query } from "../db/pool.js";
import { ApiError } from "../lib/apiError.js";

const serviceSelect = `
  SELECT
    id,
    name,
    description,
    price,
    duration_minutes AS "durationMinutes",
    created_at AS "createdAt"
  FROM services
`;

export async function listServices() {
  const result = await query(`${serviceSelect} ORDER BY name ASC, id ASC`);
  return result.rows;
}

export async function getServiceById(id) {
  const result = await query(`${serviceSelect} WHERE id = $1`, [id]);

  if (!result.rowCount) {
    throw new ApiError(404, "Service not found.");
  }

  return result.rows[0];
}

export async function createService({ name, description, price, durationMinutes }) {
  const result = await query(
    `
      INSERT INTO services (name, description, price, duration_minutes)
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        name,
        description,
        price,
        duration_minutes AS "durationMinutes",
        created_at AS "createdAt"
    `,
    [name, description || null, price, durationMinutes || null]
  );

  return result.rows[0];
}

export async function updateService(id, { name, description, price, durationMinutes }) {
  const result = await query(
    `
      UPDATE services
      SET
        name = $2,
        description = $3,
        price = $4,
        duration_minutes = $5
      WHERE id = $1
      RETURNING
        id,
        name,
        description,
        price,
        duration_minutes AS "durationMinutes",
        created_at AS "createdAt"
    `,
    [id, name, description || null, price, durationMinutes || null]
  );

  if (!result.rowCount) {
    throw new ApiError(404, "Service not found.");
  }

  return result.rows[0];
}
