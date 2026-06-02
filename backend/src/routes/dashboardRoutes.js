import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { getDashboard } from "../controllers/dashboardController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

export const dashboardRouter = Router();

dashboardRouter.use(authenticate, authorizeRoles([1]));
dashboardRouter.get("/", asyncHandler(getDashboard));
