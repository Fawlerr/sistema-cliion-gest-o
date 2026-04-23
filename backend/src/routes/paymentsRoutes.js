import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { getPayment, getPayments, postPayment, putPayment } from "../controllers/paymentsController.js";

export const paymentsRouter = Router();

paymentsRouter.get("/", asyncHandler(getPayments));
paymentsRouter.post("/", asyncHandler(postPayment));
paymentsRouter.get("/:id", asyncHandler(getPayment));
paymentsRouter.put("/:id", asyncHandler(putPayment));
