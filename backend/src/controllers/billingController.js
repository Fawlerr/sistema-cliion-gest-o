import { createExpense } from "../services/expensesService.js";
import { createPayment } from "../services/paymentsService.js";
import { listBillingEntries } from "../services/billingService.js";
import { ApiError } from "../lib/apiError.js";

export async function getBilling(_req, res) {
  const entries = await listBillingEntries();
  res.json({ data: entries, meta: { count: entries.length } });
}

export async function postBilling(req, res) {
  const { type } = req.body || {};

  if (type === "payment") {
    const amount = Number(req.body.amount);

    if (!Number.isFinite(amount)) {
      throw new ApiError(400, "Invalid payment amount.");
    }

    const payment = await createPayment({
      appointmentId: req.body.appointmentId,
      amount,
      method: req.body.method,
      status: req.body.status,
      paidAt: req.body.paidAt
    });

    res.status(201).json({ data: payment });
    return;
  }

  if (type === "expense") {
    const amount = Number(req.body.amount);

    if (!req.body.description?.trim()) {
      throw new ApiError(400, "Expense description is required.");
    }

    if (!req.body.expenseDate) {
      throw new ApiError(400, "Expense date is required.");
    }

    if (!Number.isFinite(amount)) {
      throw new ApiError(400, "Invalid expense amount.");
    }

    const expense = await createExpense({
      description: req.body.description,
      amount,
      expenseDate: req.body.expenseDate
    });

    res.status(201).json({ data: expense });
    return;
  }

  throw new ApiError(400, "Invalid billing entry type.");
}
