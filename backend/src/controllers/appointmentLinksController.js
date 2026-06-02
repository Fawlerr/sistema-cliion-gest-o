import {
  bookViaLink,
  createAppointmentLink,
  deactivateLink,
  getAppointmentLink,
  getLinkAvailability,
  listLinks
} from "../services/appointmentLinksService.js";
import { env } from "../config/env.js";
import { ApiError } from "../lib/apiError.js";
import { parseIdParam, parseOptionalDate } from "../lib/validators.js";

function validateCreatePayload(payload) {
  const expiresInHours = Number(payload.expiresInHours) || 24;

  if (expiresInHours < 1 || expiresInHours > 720) {
    throw new ApiError(400, "expiresInHours must be between 1 and 720");
  }

  const patientId = payload.patientId ? String(payload.patientId) : null;
  const serviceId = payload.serviceId ? Number(payload.serviceId) : null;
  const config = payload.config || {};

  if (typeof config !== "object") {
    throw new ApiError(400, "config must be object");
  }

  return {
    patientId,
    serviceId,
    expiresInHours,
    config,
    createdBy: payload.createdBy ? Number(payload.createdBy) : null
  };
}

function validateBookPayload(payload) {
  if (!payload.name?.trim()) {
    throw new ApiError(400, "Name required");
  }

  if (!payload.date) {
    throw new ApiError(400, "Date required");
  }

  if (!payload.time) {
    throw new ApiError(400, "Time required");
  }

  if (!payload.date.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)) {
    throw new ApiError(400, "Valid date required");
  }

  return {
    name: payload.name.trim(),
    phone: payload.phone?.trim() || null,
    email: payload.email?.trim() || null,
    date: payload.date,
    time: payload.time,
    serviceId: payload.serviceId ? Number(payload.serviceId) : null,
    notes: payload.notes?.trim() || null
  };
}

export async function postAppointmentLink(req, res) {
  const payload = validateCreatePayload({
    ...req.body,
    createdBy: req.user.userId
  });
  const link = await createAppointmentLink(payload);

  res.status(201).json({
    data: {
      ...link,
      publicUrl: `${env.frontendPublicUrl.replace(/\/$/, "")}/agendar/${link.token}`
    }
  });
}

export async function getPublicAppointmentLink(req, res) {
  const link = await getAppointmentLink(req.params.token);
  res.json({ data: link });
}

export async function getPublicLinkAvailability(req, res) {
  const date = parseOptionalDate(req.query.date, "date");

  if (!date) {
    throw new ApiError(400, "date query param required");
  }

  const availability = await getLinkAvailability(req.params.token, date);
  res.json({ data: availability });
}

export async function postPublicLinkBook(req, res) {
  const result = await bookViaLink(req.params.token, validateBookPayload(req.body));
  res.status(201).json({
    data: result.appointment,
    message: "Appointment booked successfully via secure link.",
    linkStatus: result.link
  });
}

export async function getAdminLinks(req, res) {
  const links = await listLinks(req.user.userId);
  res.json({ data: links, meta: { count: links.length } });
}

export async function patchDeactivateLink(req, res) {
  const id = parseIdParam(req.params.id, "link id");
  await deactivateLink(id);
  res.json({ message: "Link deactivated successfully" });
}
