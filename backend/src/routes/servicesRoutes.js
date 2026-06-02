import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { getService, getServices, postService, putService } from "../controllers/servicesController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

export const servicesRouter = Router();

servicesRouter.get("/", asyncHandler(getServices));
servicesRouter.get("/:id", asyncHandler(getService));
servicesRouter.post("/", authenticate, authorizeRoles([1]), asyncHandler(postService));
servicesRouter.put("/:id", authenticate, authorizeRoles([1]), asyncHandler(putService));
