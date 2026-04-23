import { pool, query } from "../db/pool.js";
import { ApiError } from "../lib/apiError.js";
import { createPatientRecord, findPatientForPublicBooking } from "./patientsService.js";

const appointmentSelect = `
  SELECT
    a.id,
    a.patient_id AS "patientId",
    a.service_id AS "serviceId",
    a.user_id AS "userId",
    a.appointment_date AS "appointmentDate",
    a.appointment_time AS "appointmentTime",
    a.status,
    a.notes,
    a.created_at AS "createdAt",
    p.name AS "patientName",
    s.name AS "serviceName",
    u.name AS "userName"
  FROM appointments a
  INNER JOIN patients p ON p.id = a.patient_id
  INNER JOIN services s ON s.id = a.service_id
  INNER JOIN users u ON u.id = a.user_id
`;

const workingHours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

function buildScopeConditions({ from, to, scope }) {
  const conditions = [];
  const values = [];

  if (scope === "today") {
    conditions.push("a.appointment_date = CURRENT_DATE");
  } else if (scope === "future") {
    conditions.push("a.appointment_date > CURRENT_DATE");
  } else if (scope === "past") {
    conditions.push("a.appointment_date < CURRENT_DATE");
  }

  if (from) {
    values.push(from);
    conditions.push(`a.appointment_date >= $${values.length}`);
  }

  if (to) {
    values.push(to);
    conditions.push(`a.appointment_date <= $${values.length}`);
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
     ORDER BY a.appointment_date ASC, a.appointment_time ASC, a.id ASC
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
  const result = await query(
    `
      INSERT INTO appointments (patient_id, service_id, user_id, appointment_date, appointment_time, status, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `,
    [patientId, serviceId, userId, appointmentDate, appointmentTime, status || null, notes || null]
  );

  return getAppointmentById(result.rows[0].id);
}

export async function updateAppointment(id, { patientId, serviceId, userId, appointmentDate, appointmentTime, status, notes }) {
  const result = await query(
    `
      UPDATE appointments
      SET
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
      SELECT DISTINCT TO_CHAR(appointment_time, 'HH24:MI') AS time
      FROM appointments
      WHERE appointment_date = $1
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
      WHERE appointment_date = $1
        AND appointment_time = $2
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
      ORDER BY created_at ASC, id ASC
      LIMIT 1
    `
  );

  if (!result.rowCount) {
    throw new ApiError(409, "No professionals are available for booking.");
  }

  return result.rows[0].id;
}

export async function createPublicAppointment({ patientName, email, phone, serviceId, appointmentDate, appointmentTime, notes }) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await ensureServiceExists(serviceId, client);
    const normalizedTime = validateWorkingHour(appointmentTime);
    await ensurePublicSlotAvailable(appointmentDate, normalizedTime, client);

    const patient =
      await findPatientForPublicBooking({ name: patientName, email, phone }, client) ||
      await createPatientRecord(
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
    const insertResult = await client.query(
      `
        INSERT INTO appointments (patient_id, service_id, user_id, appointment_date, appointment_time, status, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `,
      [patient.id, serviceId, userId, appointmentDate, normalizedTime, "pending", notes || null]
    );

    await client.query("COMMIT");
    return getAppointmentById(insertResult.rows[0].id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
