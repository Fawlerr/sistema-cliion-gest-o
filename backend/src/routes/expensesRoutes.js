import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { getExpense, getExpenses, postExpense, putExpense } from "../controllers/expensesController.js";

export const expensesRouter = Router();

expensesRouter.get("/", asyncHandler(getExpenses));
expensesRouter.post("/", asyncHandler(postExpense));
expensesRouter.get("/:id", asyncHandler(getExpense));
expensesRouter.put("/:id", asyncHandler(putExpense));
