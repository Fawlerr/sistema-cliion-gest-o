import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { getService, getServices, postService, putService } from "../controllers/servicesController.js";

export const servicesRouter = Router();

servicesRouter.get("/", asyncHandler(getServices));
servicesRouter.post("/", asyncHandler(postService));
servicesRouter.get("/:id", asyncHandler(getService));
servicesRouter.put("/:id", asyncHandler(putService));
