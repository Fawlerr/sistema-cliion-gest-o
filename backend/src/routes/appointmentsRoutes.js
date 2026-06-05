import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import {
  getAppointment,
  getAppointments,
  getAppointmentsAvailability,
  patchCancelAppointment,
  postAppointment,
  postPublicAppointment,
  putAppointment,
  deleteAppointmentById
} from "../controllers/appointmentsController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

export const appointmentsRouter = Router();

appointmentsRouter.get("/availability", asyncHandler(getAppointmentsAvailability));
appointmentsRouter.post("/public", asyncHandler(postPublicAppointment));
appointmentsRouter.get("/", authenticate, authorizeRoles([1, 2]), asyncHandler(getAppointments));
appointmentsRouter.post("/", authenticate, authorizeRoles([1, 2]), asyncHandler(postAppointment));
appointmentsRouter.get("/:id", authenticate, authorizeRoles([1, 2]), asyncHandler(getAppointment));
appointmentsRouter.put("/:id", authenticate, authorizeRoles([1, 2]), asyncHandler(putAppointment));
appointmentsRouter.patch("/:id/cancel", authenticate, authorizeRoles([1, 2]), asyncHandler(patchCancelAppointment));
appointmentsRouter.delete("/:id", authenticate, authorizeRoles([1]), asyncHandler(deleteAppointmentById));
