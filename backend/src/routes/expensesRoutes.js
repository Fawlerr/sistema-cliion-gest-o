import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { getExpense, getExpenses, postExpense, putExpense } from "../controllers/expensesController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

export const expensesRouter = Router();

expensesRouter.use(authenticate, authorizeRoles([1]));
expensesRouter.get("/", asyncHandler(getExpenses));
expensesRouter.post("/", asyncHandler(postExpense));
expensesRouter.get("/:id", asyncHandler(getExpense));
expensesRouter.put("/:id", asyncHandler(putExpense));
