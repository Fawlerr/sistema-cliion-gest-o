import crypto from "crypto";
import { query } from "../db/pool.js";
import { ApiError } from "../lib/apiError.js";

const medicalRecordSelect = `
  SELECT
    id,
    "patientId",
    type,
    date,
    notes,
    data,
    "createdAt"
  FROM medical_records
`;

export async function listMedicalRecords(patientId) {
  const result = await query(
    `${medicalRecordSelect}
     WHERE "patientId" = $1
     ORDER BY date DESC, "createdAt" DESC`,
    [patientId]
  );

  return result.rows;
}

export async function createMedicalRecord({ patientId, type, date, notes, data }) {
  const patient = await query("SELECT id FROM patients WHERE id = $1", [patientId]);

  if (!patient.rowCount) {
    throw new ApiError(404, "Patient not found.");
  }

  const result = await query(
    `
      INSERT INTO medical_records (id, "patientId", type, date, notes, data)
      VALUES ($1, $2, $3, $4, $5, $6::jsonb)
      RETURNING
        id,
        "patientId",
        type,
        date,
        notes,
        data,
        "createdAt"
    `,
    [
      `record-${crypto.randomUUID()}`,
      patientId,
      type,
      date,
      notes || null,
      JSON.stringify(data || {})
    ]
  );

  return result.rows[0];
}
