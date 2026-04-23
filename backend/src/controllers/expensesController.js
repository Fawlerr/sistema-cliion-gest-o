import { createExpense, getExpenseById, listExpenses, updateExpense } from "../services/expensesService.js";
import { ApiError } from "../lib/apiError.js";
import { parseIdParam } from "../lib/validators.js";

function validateExpensePayload(payload) {
  if (!payload?.description?.trim()) {
    throw new ApiError(400, "Expense description is required.");
  }

  if (!payload.expenseDate) {
    throw new ApiError(400, "Expense date is required.");
  }

  const amount = Number(payload.amount);

  if (!Number.isFinite(amount)) {
    throw new ApiError(400, "Invalid expense amount.");
  }

  return {
    description: payload.description.trim(),
    amount,
    expenseDate: payload.expenseDate
  };
}

export async function getExpenses(_req, res) {
  const expenses = await listExpenses();
  res.json({ data: expenses, meta: { count: expenses.length } });
}

export async function getExpense(req, res) {
  const expenseId = parseIdParam(req.params.id, "expense id");
  const expense = await getExpenseById(expenseId);
  res.json({ data: expense });
}

export async function postExpense(req, res) {
  const expense = await createExpense(validateExpensePayload(req.body));
  res.status(201).json({ data: expense });
}

export async function putExpense(req, res) {
  const expenseId = parseIdParam(req.params.id, "expense id");
  const expense = await updateExpense(expenseId, validateExpensePayload(req.body));
  res.json({ data: expense });
}
