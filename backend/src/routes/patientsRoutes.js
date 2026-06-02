import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { getPatient, getPatients, postPatient, putPatient } from "../controllers/patientsController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

export const patientsRouter = Router();

// Apenas autenticação geral (todos logados passam)
patientsRouter.use(authenticate);

// Todos logados podem ver a lista e ver um paciente específico
patientsRouter.get("/", asyncHandler(getPatients));
patientsRouter.get("/:id", asyncHandler(getPatient));

// Apenas ADMIN e DOCTOR podem criar e editar (a catraca entra aqui!)
patientsRouter.post("/", authorizeRoles('ADMIN', 'DOCTOR'), asyncHandler(postPatient));
patientsRouter.put("/:id", authorizeRoles('ADMIN', 'DOCTOR'), asyncHandler(putPatient));