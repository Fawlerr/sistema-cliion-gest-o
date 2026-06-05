import crypto from "crypto";
import { pool, query } from "../db/pool.js";
import { ApiError } from "../lib/apiError.js";
import { createPatientRecord, findPatientForPublicBooking } from "./patientsService.js";

const appointmentSelect = `
  SELECT
    a.id,
    a."patientId",
    a."serviceId",
    a."userId",
    a."appointmentDate",
    a."appointmentTime",
    a.status,
    a.notes,
    a."createdAt",
    p.name AS "patientName",
    s.name AS "serviceName",
    COALESCE(u.name, CONCAT('Profissional #', a."userId"::text)) AS "userName"
  FROM appointments a
  INNER JOIN patients p ON p.id = a."patientId"
  INNER JOIN services s ON s.id = a."serviceId"
  LEFT JOIN users u ON u.id::text = a."userId"::text
`;

const workingHours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

function buildScopeConditions({ from, to, scope }) {
  const conditions = [];
  const values = [];

  if (scope === "today") {
    conditions.push(`a."appointmentDate" = CURRENT_DATE`);
  } else if (scope === "future") {
    conditions.push(`a."appointmentDate" > CURRENT_DATE`);
  } else if (scope === "past") {
    conditions.push(`a."appointmentDate" < CURRENT_DATE`);
  }

  if (from) {
    values.push(from);
    conditions.push(`a."appointmentDate" >= $${values.length}`);
  }

  if (to) {
    values.push(to);
    conditions.push(`a."appointmentDate" <= $${values.length}`);
  }

  return { conditions, values };
}

export async function listAppointments({ from, to, limit, scope }) {
  const { conditions, values } = buildScopeConditions({ from, to, scope });
  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  values.push(limit);

  const result = await query(
    `${appointmentSelect}
     ${whereClause}
     ORDER BY a."appointmentDate" ASC, a."appointmentTime" ASC, a.id ASC
     LIMIT $${values.length}`,
    values
  );

  return result.rows;
}

export async function getAppointmentById(id) {
  const result = await query(`${appointmentSelect} WHERE a.id = $1`, [id]);

  if (!result.rowCount) {
    throw new ApiError(404, "Appointment not found.");
  }

  return result.rows[0];
}

export async function createAppointment({ patientId, serviceId, userId, appointmentDate, appointmentTime, status, notes }) {
  const appointmentId = crypto.randomUUID();
  const result = await query(
    `
      INSERT INTO appointments (
        id,
        "patientId",
        "serviceId",
        "userId",
        "appointmentDate",
        "appointmentTime",
        patient_id,
        service_id,
        user_id,
        appointment_date,
        appointment_time,
        status,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `,
    [appointmentId, patientId, serviceId, userId, appointmentDate, appointmentTime, status || null, notes || null]
  );

  return getAppointmentById(result.rows[0].id);
}

export async function updateAppointment(id, { patientId, serviceId, userId, appointmentDate, appointmentTime, status, notes }) {
  const result = await query(
    `
      UPDATE appointments
      SET
        "patientId" = $2,
        "serviceId" = $3,
        "userId" = $4,
        "appointmentDate" = $5,
        "appointmentTime" = $6,
        patient_id = $2,
        service_id = $3,
        user_id = $4,
        appointment_date = $5,
        appointment_time = $6,
        status = $7,
        notes = $8
      WHERE id = $1
      RETURNING id
    `,
    [id, patientId, serviceId, userId, appointmentDate, appointmentTime, status || null, notes || null]
  );

  if (!result.rowCount) {
    throw new ApiError(404, "Appointment not found.");
  }

  return getAppointmentById(id);
}

function normalizeSlotTime(value) {
  if (!value) {
    throw new ApiError(400, "Appointment time is required.");
  }

  const normalized = String(value).slice(0, 5);

  if (!/^\d{2}:\d{2}$/.test(normalized)) {
    throw new ApiError(400, "Invalid appointment time.");
  }

  return normalized;
}

export function validateWorkingHour(appointmentTime) {
  const normalized = normalizeSlotTime(appointmentTime);

  if (!workingHours.includes(normalized)) {
    throw new ApiError(400, "Appointments must be booked between 08:00 and 17:00.");
  }

  return normalized;
}

export async function listOccupiedSlotsByDate(date, db = { query }) {
  const result = await db.query(
    `
      SELECT DISTINCT LEFT("appointmentTime"::text, 5) AS time
      FROM appointments
      WHERE "appointmentDate" = $1
        AND COALESCE(LOWER(status), '') <> 'canceled'
      ORDER BY time ASC
    `,
    [date]
  );

  return result.rows.map((row) => row.time);
}

async function ensureServiceExists(serviceId, db) {
  const result = await db.query("SELECT id FROM services WHERE id = $1", [serviceId]);

  if (!result.rowCount) {
    throw new ApiError(404, "Service not found.");
  }
}

async function ensurePublicSlotAvailable(appointmentDate, appointmentTime, db) {
  const result = await db.query(
    `
      SELECT 1
      FROM appointments
      WHERE "appointmentDate" = $1
        AND LEFT("appointmentTime"::text, 5) = $2
        AND COALESCE(LOWER(status), '') <> 'canceled'
      LIMIT 1
    `,
    [appointmentDate, appointmentTime]
  );

  if (result.rowCount) {
    throw new ApiError(409, "The selected time slot is no longer available.");
  }
}

async function getDefaultPublicUserId(db) {
  const result = await db.query(
    `
      SELECT id
      FROM users
      ORDER BY id ASC
      LIMIT 1
    `
  );

  return result.rowCount ? result.rows[0].id : null;
}

function namesMatch(left, right) {
  return String(left || "").trim().toLowerCase() === String(right || "").trim().toLowerCase();
}

export async function createPublicAppointment(
  { patientName, email, phone, serviceId, appointmentDate, appointmentTime, notes },
  existingClient = null
) {
  const client = existingClient || (await pool.connect());
  const shouldManageTransaction = !existingClient;

  try {
    if (shouldManageTransaction) {
      await client.query("BEGIN");
    }
    await ensureServiceExists(serviceId, client);
    const normalizedTime = validateWorkingHour(appointmentTime);
    await ensurePublicSlotAvailable(appointmentDate, normalizedTime, client);

    const existingPatient = await findPatientForPublicBooking({ name: patientName, email, phone }, client);
    const patient =
      existingPatient && namesMatch(existingPatient.name, patientName)
        ? existingPatient
        : await createPatientRecord(
        {
          name: patientName.trim(),
          email: email?.trim() || null,
          phone: phone?.trim() || null,
          birthDate: null,
          address: null
        },
        client
      );

    const userId = await getDefaultPublicUserId(client);
    const appointmentId = crypto.randomUUID();
    const insertResult = await client.query(
      `
        INSERT INTO appointments (
          id,
          "patientId",
          "serviceId",
          "userId",
          "appointmentDate",
          "appointmentTime",
          patient_id,
          service_id,
          user_id,
          appointment_date,
          appointment_time,
          status,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `,
      [appointmentId, patient.id, serviceId, userId, appointmentDate, normalizedTime, "pending", notes || null]
    );

    if (shouldManageTransaction) {
      await client.query("COMMIT");
    }
    return getAppointmentById(insertResult.rows[0].id);
  } catch (error) {
    if (shouldManageTransaction) {
      await client.query("ROLLBACK");
    }
    throw error;
  } finally {
    if (shouldManageTransaction) {
      client.release();
    }
  }
}
