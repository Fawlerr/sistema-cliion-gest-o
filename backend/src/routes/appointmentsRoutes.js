import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import {
  getAppointment,
  getAppointments,
  getAppointmentsAvailability,
  postAppointment,
  postPublicAppointment,
  putAppointment
} from "../controllers/appointmentsController.js";

export const appointmentsRouter = Router();

appointmentsRouter.get("/availability", asyncHandler(getAppointmentsAvailability));
appointmentsRouter.get("/", asyncHandler(getAppointments));
appointmentsRouter.post("/", asyncHandler(postAppointment));
appointmentsRouter.post("/public", asyncHandler(postPublicAppointment));
appointmentsRouter.get("/:id", asyncHandler(getAppointment));
appointmentsRouter.put("/:id", asyncHandler(putAppointment));
