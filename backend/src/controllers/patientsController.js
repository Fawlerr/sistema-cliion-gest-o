import { createPatient, getPatientById, listPatients, updatePatient } from "../services/patientsService.js";
import { ApiError } from "../lib/apiError.js";
import { parseIdParam } from "../lib/validators.js";

function normalizeBirthDateFromPayload(payload) {
  if (payload.birthDate) {
    return payload.birthDate;
  }

  if (payload.age === undefined || payload.age === null || payload.age === "") {
    return null;
  }

  const age = Number.parseInt(payload.age, 10);

  if (!Number.isInteger(age) || age < 0 || age > 130) {
    throw new ApiError(400, "Invalid age.");
  }

  const today = new Date();
  const birthDate = new Date(today.getFullYear() - age, 0, 1);
  return birthDate.toISOString().slice(0, 10);
}

function validatePatientPayload(payload) {
  if (!payload?.name?.trim()) {
    throw new ApiError(400, "Patient name is required.");
  }

  return {
    name: payload.name.trim(),
    email: payload.email?.trim() || null,
    phone: payload.phone?.trim() || null,
    birthDate: normalizeBirthDateFromPayload(payload),
    address: payload.address?.trim() || null
  };
}

export async function getPatients(req, res) {
  const patients = await listPatients({
    search: req.query.search
  });

  res.json({ data: patients, meta: { count: patients.length } });
}

export async function getPatient(req, res) {
  const patientId = parseIdParam(req.params.id, "patient id");
  const patient = await getPatientById(patientId);
  res.json({ data: patient });
}

export async function postPatient(req, res) {
  const patient = await createPatient(validatePatientPayload(req.body));
  res.status(201).json({ data: patient });
}

export async function putPatient(req, res) {
  const patientId = parseIdParam(req.params.id, "patient id");
  const patient = await updatePatient(patientId, validatePatientPayload(req.body));
  res.json({ data: patient });
}
