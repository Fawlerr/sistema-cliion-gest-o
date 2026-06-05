import { ApiError } from "../lib/apiError.js";
import { createMedicalRecord, listMedicalRecords } from "../services/medicalRecordsService.js";

function parsePatientId(value) {
  const patientId = String(value || "").trim();

  if (!patientId) {
    throw new ApiError(400, "Invalid patient id.");
  }

  return patientId;
}

function validateMedicalRecordPayload(payload) {
  if (!payload?.type?.trim()) {
    throw new ApiError(400, "Medical record type is required.");
  }

  if (!payload.date) {
    throw new ApiError(400, "Medical record date is required.");
  }

  return {
    type: payload.type.trim(),
    date: payload.date,
    notes: payload.notes?.trim() || null,
    data: payload.data && typeof payload.data === "object" ? payload.data : {}
  };
}

export async function getPatientMedicalRecords(req, res) {
  const patientId = parsePatientId(req.params.id);
  const records = await listMedicalRecords(patientId);
  res.json({ data: records, meta: { count: records.length } });
}

export async function postPatientMedicalRecord(req, res) {
  const patientId = parsePatientId(req.params.id);
  const record = await createMedicalRecord({
    patientId,
    ...validateMedicalRecordPayload(req.body)
  });

  res.status(201).json({ data: record });
}
