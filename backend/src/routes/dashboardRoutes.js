import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { getDashboard } from "../controllers/dashboardController.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", asyncHandler(getDashboard));
