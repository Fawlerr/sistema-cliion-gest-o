import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { getBilling, postBilling } from "../controllers/billingController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

export const billingRouter = Router();

billingRouter.use(authenticate, authorizeRoles([1]));
billingRouter.get("/", asyncHandler(getBilling));
billingRouter.post("/", asyncHandler(postBilling));
