import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { getPatient, getPatients, postPatient, putPatient } from "../controllers/patientsController.js";

export const patientsRouter = Router();

patientsRouter.get("/", asyncHandler(getPatients));
patientsRouter.post("/", asyncHandler(postPatient));
patientsRouter.get("/:id", asyncHandler(getPatient));
patientsRouter.put("/:id", asyncHandler(putPatient));
