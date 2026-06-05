import crypto from "crypto";
import { pool, query } from "../db/pool.js";
import { ApiError } from "../lib/apiError.js";

const patientSelect = `
  SELECT
    id,
    name,
    email,
    phone,
    "birthDate",
    address,
    "createdAt"
  FROM patients
`;

export async function listPatients({ search }) {
  const filters = [];
  const values = [];

  if (search) {
    values.push(`%${search.trim().toLowerCase()}%`);
    filters.push(`(
      LOWER(name) LIKE $${values.length}
      OR LOWER(COALESCE(email, '')) LIKE $${values.length}
      OR LOWER(COALESCE(phone, '')) LIKE $${values.length}
    )`);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const result = await query(`${patientSelect} ${whereClause} ORDER BY name ASC, id ASC`, values);
  return result.rows;
}

export async function getPatientById(id) {
  const result = await query(`${patientSelect} WHERE id = $1`, [id]);

  if (!result.rowCount) {
    throw new ApiError(404, "Patient not found.");
  }

  return result.rows[0];
}

export async function findPatientForPublicBooking({ name, email, phone }, db = { query }) {
  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedPhone = phone?.trim();

  if (normalizedEmail) {
    const result = await db.query(`${patientSelect} WHERE LOWER(email) = $1 ORDER BY id ASC LIMIT 1`, [normalizedEmail]);
    if (result.rowCount) {
      return result.rows[0];
    }
  }

  if (normalizedPhone) {
    const result = await db.query(`${patientSelect} WHERE phone = $1 ORDER BY id ASC LIMIT 1`, [normalizedPhone]);
    if (result.rowCount) {
      return result.rows[0];
    }
  }

  return null;
}

export async function createPatientRecord({ name, email, phone, birthDate, address }, db = { query }) {
  // Gerando um ID único à força pelo Node.js!
  const generatedId = crypto.randomUUID();

  const result = await db.query(
    `
      INSERT INTO patients (id, name, email, phone, "birthDate", address)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        name,
        email,
        phone,
        "birthDate",
        address,
        "createdAt"
    `,
    [generatedId, name, email || null, phone || null, birthDate || null, address || null]
  );

  return result.rows[0];
}

export async function createPatient({ name, email, phone, birthDate, address }) {
  return createPatientRecord({ name, email, phone, birthDate, address });
}

export async function updatePatient(id, { name, email, phone, birthDate, address }) {
  const result = await query(
    `
      UPDATE patients
      SET
        name = $2,
        email = $3,
        phone = $4,
        "birthDate" = $5,
        address = $6
      WHERE id = $1
      RETURNING
        id,
        name,
        email,
        phone,
        "birthDate",
        address,
        "createdAt"
    `,
    [id, name, email || null, phone || null, birthDate || null, address || null]
  );

  if (!result.rowCount) {
    throw new ApiError(404, "Patient not found.");
  }

  return result.rows[0];
}

export async function deletePatient(id) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `
        UPDATE payments
        SET "appointmentId" = NULL
        WHERE "appointmentId" IN (
          SELECT id FROM appointments WHERE "patientId" = $1 OR patient_id = $1
        )
      `,
      [id]
    );
    await client.query(`DELETE FROM medical_records WHERE "patientId" = $1`, [id]);
    await client.query(`DELETE FROM appointments WHERE "patientId" = $1 OR patient_id = $1`, [id]);

    const result = await client.query(`DELETE FROM patients WHERE id = $1 RETURNING id`, [id]);

    if (!result.rowCount) {
      throw new ApiError(404, "Patient not found.");
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
