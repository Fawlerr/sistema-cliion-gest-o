import { createService, getServiceById, listServices, updateService } from "../services/servicesService.js";
import { ApiError } from "../lib/apiError.js";
import { parseIdParam } from "../lib/validators.js";

function validateServicePayload(payload) {
  if (!payload?.name?.trim()) {
    throw new ApiError(400, "Service name is required.");
  }

  const price = Number(payload.price);
  const durationMinutes = payload.durationMinutes === "" || payload.durationMinutes === undefined || payload.durationMinutes === null
    ? null
    : Number.parseInt(payload.durationMinutes, 10);

  if (!Number.isFinite(price)) {
    throw new ApiError(400, "Invalid service price.");
  }

  if (durationMinutes !== null && (!Number.isInteger(durationMinutes) || durationMinutes <= 0)) {
    throw new ApiError(400, "Invalid service duration.");
  }

  return {
    name: payload.name.trim(),
    description: payload.description?.trim() || null,
    price,
    durationMinutes
  };
}

export async function getServices(_req, res) {
  const services = await listServices();
  res.json({ data: services, meta: { count: services.length } });
}

export async function getService(req, res) {
  const serviceId = parseIdParam(req.params.id, "service id");
  const service = await getServiceById(serviceId);
  res.json({ data: service });
}

export async function postService(req, res) {
  const service = await createService(validateServicePayload(req.body));
  res.status(201).json({ data: service });
}

export async function putService(req, res) {
  const serviceId = parseIdParam(req.params.id, "service id");
  const service = await updateService(serviceId, validateServicePayload(req.body));
  res.json({ data: service });
}
