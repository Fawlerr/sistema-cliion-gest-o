import crypto from "crypto";
import { pool, query } from "../db/pool.js";
import { ApiError } from "../lib/apiError.js";
import { createPublicAppointment, listOccupiedSlotsByDate } from "./appointmentsService.js";

const workingHours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

export function generateToken() {
  return crypto.randomUUID();
}

export async function createAppointmentLink({ patientId, serviceId, expiresInHours = 24, config = {}, createdBy }) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
  const linkConfig = {
    startHour: config.startHour || "08:00",
    endHour: config.endHour || "18:00",
    slotDuration: config.slotDuration || 30,
    maxUses: config.maxUses || 1, // 1 for single use, null unlimited
    ...config
  };

  const result = await query(
    `INSERT INTO appointment_links (token, patient_id, service_id, expires_at, config, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, token, expires_at, config`,
    [token, patientId || null, serviceId || null, expiresAt, JSON.stringify(linkConfig), createdBy || null]
  );

  if (!result.rowCount) {
    throw new ApiError(500, "Failed to create appointment link");
  }

  return result.rows[0];
}

export async function getAppointmentLink(token) {
  const result = await query(
    `SELECT id, token, patient_id as "patientId", service_id as "serviceId", 
            expires_at as "expiresAt", used, active, config::jsonb, created_by as "createdBy", created_at as "createdAt"
     FROM appointment_links 
     WHERE token = $1`,
    [token]
  );

  if (!result.rowCount) {
    throw new ApiError(404, "Invalid or expired appointment link");
  }

  const link = result.rows[0];
  const now = new Date();

  if (!link.active) {
    throw new ApiError(403, "Appointment link is deactivated");
  }
  if (link.used && link.config.maxUses === 1) {
    throw new ApiError(403, "Appointment link has already been used");
  }
  if (link.expiresAt && link.expiresAt < now) {
    throw new ApiError(410, "Appointment link has expired");
  }

  return link;
}

export async function markLinkUsed(token) {
  await query(
    `UPDATE appointment_links SET used = true WHERE token = $1 AND (config->>'maxUses' = '1' OR used = false)`,
    [token]
  );
}

export async function deactivateLink(id) {
  await query(`UPDATE appointment_links SET active = false WHERE id = $1`, [id]);
}

export async function getLinkAvailability(token, date) {
  const link = await getAppointmentLink(token);
  const config = link.config;
  const startHour = config.startHour;
  const endHour = config.endHour;

  // Generate available slots based on config
  const slots = generateSlots(startHour, endHour, config.slotDuration || 30);
  
  const occupied = await listOccupiedSlotsByDate(date);

  return {
    date,
    link,
    config,
    availableSlots: slots.filter(slot => !occupied.includes(slot)),
    occupiedSlots: occupied.filter(slot => slots.includes(slot))
  };
}

function generateSlots(startHour, endHour, durationMinutes) {
  const slots = [];
  const [startH, startM] = startHour.split(":").map(Number);
  const [endH, endM] = endHour.split(":").map(Number);
  
  let currentMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  while (currentMinutes < endMinutes) {
    const h = Math.floor(currentMinutes / 60).toString().padStart(2, "0");
    const m = (currentMinutes % 60).toString().padStart(2, "0");
    slots.push(`${h}:${m}`);
    currentMinutes += durationMinutes;
  }

  return slots.filter(time => workingHours.includes(time));
}

export async function bookViaLink(token, { name, phone, email, date, time, notes, serviceId }) {
  const client = await pool.connect();
  const link = await getAppointmentLink(token);

  try {
    await client.query("BEGIN");

    // Override serviceId from link if provided
    const finalServiceId = serviceId || link.serviceId;
    const appointment = await createPublicAppointment({
      patientName: name,
      email,
      phone,
      serviceId: finalServiceId,
      appointmentDate: date,
      appointmentTime: time,
      notes
    }, client);

    // Mark used if single use
    if (link.config.maxUses === 1) {
      await client.query(
        `UPDATE appointment_links SET used = true WHERE token = $1 AND (config->>'maxUses' = '1' OR used = false)`,
        [token]
      );
    }

    await client.query("COMMIT");
    return { appointment, link };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listLinks(createdBy) {
  const result = await query(
    `SELECT id, token, patient_id as "patientId", service_id as "serviceId", 
            expires_at as "expiresAt", used, active, config, created_at as "createdAt"
     FROM appointment_links 
     WHERE created_by = $1
     ORDER BY created_at DESC`,
    [createdBy]
  );
  return result.rows;
}

