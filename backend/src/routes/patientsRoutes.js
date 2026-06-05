import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { deletePatientById, getPatient, getPatients, postPatient, putPatient } from "../controllers/patientsController.js";
import { getPatientMedicalRecords, postPatientMedicalRecord } from "../controllers/medicalRecordsController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

export const patientsRouter = Router();

// Apenas autenticação geral (todos logados passam)
patientsRouter.use(authenticate);

// Todos logados podem ver a lista e ver um paciente específico
patientsRouter.get("/", asyncHandler(getPatients));
patientsRouter.get("/:id/medical-records", asyncHandler(getPatientMedicalRecords));
patientsRouter.post("/:id/medical-records", authorizeRoles([1, 2]), asyncHandler(postPatientMedicalRecord));
patientsRouter.get("/:id", asyncHandler(getPatient));

// Apenas ADMIN e DOCTOR podem criar e editar (a catraca entra aqui!)
patientsRouter.post("/", authorizeRoles([1, 2]), asyncHandler(postPatient));
patientsRouter.put("/:id", authorizeRoles([1, 2]), asyncHandler(putPatient));
patientsRouter.delete("/:id", authorizeRoles([1]), asyncHandler(deletePatientById));
