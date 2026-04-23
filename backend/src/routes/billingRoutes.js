import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { getBilling, postBilling } from "../controllers/billingController.js";

export const billingRouter = Router();

billingRouter.get("/", asyncHandler(getBilling));
billingRouter.post("/", asyncHandler(postBilling));
