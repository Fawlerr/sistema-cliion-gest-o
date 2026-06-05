import {
  createAppointment,
  createPublicAppointment,
  getAppointmentById,
  listAppointments,
  listOccupiedSlotsByDate,
  updateAppointment,
  validateWorkingHour
} from "../services/appointmentsService.js";
import { ApiError } from "../lib/apiError.js";
import { parseOptionalDate, parseOptionalInteger } from "../lib/validators.js";

function parseAppointmentIdParam(value) {
  const appointmentId = String(value || "").trim();

  if (!appointmentId) {
    throw new ApiError(400, "Invalid appointment id.");
  }

  return appointmentId;
}

function validateAppointmentPayload(payload) {
  const patientId = String(payload.patientId || "").trim();
  const serviceId = Number.parseInt(payload.serviceId, 10);
  const userId = String(payload.userId || "").trim();

  if (!patientId) {
    throw new ApiError(400, "Invalid patient.");
  }

  if (!Number.isInteger(serviceId) || serviceId <= 0) {
    throw new ApiError(400, "Invalid service.");
  }

  if (!userId) {
    throw new ApiError(400, "Invalid professional.");
  }

  if (!payload.appointmentDate) {
    throw new ApiError(400, "Appointment date is required.");
  }

  if (!payload.appointmentTime) {
    throw new ApiError(400, "Appointment time is required.");
  }

  return {
    patientId,
    serviceId,
    userId,
    appointmentDate: payload.appointmentDate,
    appointmentTime: payload.appointmentTime,
    status: payload.status?.trim() || null,
    notes: payload.notes?.trim() || null
  };
}

function validatePublicAppointmentPayload(payload) {
  if (!payload?.patientName?.trim()) {
    throw new ApiError(400, "Patient name is required.");
  }

  const serviceId = Number.parseInt(payload.serviceId, 10);

  if (!Number.isInteger(serviceId) || serviceId <= 0) {
    throw new ApiError(400, "Invalid service.");
  }

  if (!payload.appointmentDate) {
    throw new ApiError(400, "Appointment date is required.");
  }

  const appointmentTime = validateWorkingHour(payload.appointmentTime);

  const appointmentDateTime = new Date(`${payload.appointmentDate}T${appointmentTime}`);

  if (Number.isNaN(appointmentDateTime.getTime())) {
    throw new ApiError(400, "Invalid appointment date or time.");
  }

  if (appointmentDateTime.getTime() < Date.now()) {
    throw new ApiError(400, "Appointments cannot be booked in the past.");
  }

  return {
    patientName: payload.patientName.trim(),
    email: payload.email?.trim() || null,
    phone: payload.phone?.trim() || null,
    serviceId,
    appointmentDate: payload.appointmentDate,
    appointmentTime,
    notes: payload.notes?.trim() || null
  };
}

export async function getAppointments(req, res) {
  const appointments = await listAppointments({
    from: parseOptionalDate(req.query.from, "from"),
    to: parseOptionalDate(req.query.to, "to"),
    scope: req.query.scope || null,
    limit: parseOptionalInteger(req.query.limit, {
      min: 1,
      max: 500,
      fallback: 200,
      label: "limit"
    })
  });

  res.json({ data: appointments, meta: { count: appointments.length } });
}

export async function getAppointment(req, res) {
  const appointmentId = parseAppointmentIdParam(req.params.id);
  const appointment = await getAppointmentById(appointmentId);
  res.json({ data: appointment });
}

export async function getAppointmentsAvailability(req, res) {
  if (!req.query.date) {
    throw new ApiError(400, "date query parameter is required.");
  }

  const date = parseOptionalDate(req.query.date, "date");
  const occupiedSlots = await listOccupiedSlotsByDate(date);

  res.json({
    data: {
      date,
      occupiedSlots
    }
  });
}

export async function postAppointment(req, res) {
  const appointment = await createAppointment(validateAppointmentPayload(req.body));
  res.status(201).json({ data: appointment });
}

export async function postPublicAppointment(req, res) {
  const appointment = await createPublicAppointment(validatePublicAppointmentPayload(req.body));
  res.status(201).json({
    data: appointment,
    message: "Appointment booked successfully."
  });
}

export async function putAppointment(req, res) {
  const appointmentId = parseAppointmentIdParam(req.params.id);
  const appointment = await updateAppointment(appointmentId, validateAppointmentPayload(req.body));
  res.json({ data: appointment });
}
