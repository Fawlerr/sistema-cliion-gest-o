import { createPayment, getPaymentById, listPayments, updatePayment } from "../services/paymentsService.js";
import { ApiError } from "../lib/apiError.js";
import { parseIdParam } from "../lib/validators.js";

function validatePaymentPayload(payload) {
  const amount = Number(payload.amount);

  if (!Number.isFinite(amount)) {
    throw new ApiError(400, "Invalid payment amount.");
  }

  const appointmentId = payload.appointmentId === undefined || payload.appointmentId === null || payload.appointmentId === ""
    ? null
    : Number.parseInt(payload.appointmentId, 10);

  if (appointmentId !== null && (!Number.isInteger(appointmentId) || appointmentId <= 0)) {
    throw new ApiError(400, "Invalid appointment for payment.");
  }

  return {
    appointmentId,
    amount,
    method: payload.method?.trim() || null,
    status: payload.status?.trim() || null,
    paidAt: payload.paidAt || null
  };
}

export async function getPayments(_req, res) {
  const payments = await listPayments();
  res.json({ data: payments, meta: { count: payments.length } });
}

export async function getPayment(req, res) {
  const paymentId = parseIdParam(req.params.id, "payment id");
  const payment = await getPaymentById(paymentId);
  res.json({ data: payment });
}

export async function postPayment(req, res) {
  const payment = await createPayment(validatePaymentPayload(req.body));
  res.status(201).json({ data: payment });
}

export async function putPayment(req, res) {
  const paymentId = parseIdParam(req.params.id, "payment id");
  const payment = await updatePayment(paymentId, validatePaymentPayload(req.body));
  res.json({ data: payment });
}
