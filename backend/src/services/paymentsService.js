import { query } from "../db/pool.js";
import { ApiError } from "../lib/apiError.js";

const paymentSelect = `
  SELECT
    pay.id,
    pay."appointmentId",
    pay.amount,
    pay.method,
    pay.status,
    pay."paidAt",
    pay."createdAt",
    a."appointmentDate",
    a."appointmentTime",
    p.id AS "patientId",
    p.name AS "patientName",
    s.id AS "serviceId",
    s.name AS "serviceName"
  FROM payments pay
  LEFT JOIN appointments a ON a.id = pay."appointmentId"
  LEFT JOIN patients p ON p.id = a."patientId"
  LEFT JOIN services s ON s.id = a."serviceId"
`;

export async function listPayments() {
  const result = await query(`${paymentSelect} ORDER BY pay."createdAt" DESC, pay.id DESC`);
  return result.rows;
}

export async function getPaymentById(id) {
  const result = await query(`${paymentSelect} WHERE pay.id = $1`, [id]);

  if (!result.rowCount) {
    throw new ApiError(404, "Payment not found.");
  }

  return result.rows[0];
}

export async function createPayment({ appointmentId, amount, method, status, paidAt }) {
  const result = await query(
    `
      INSERT INTO payments ("appointmentId", amount, method, status, "paidAt")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `,
    [appointmentId || null, amount, method || null, status || null, paidAt || null]
  );

  return getPaymentById(result.rows[0].id);
}

export async function updatePayment(id, { appointmentId, amount, method, status, paidAt }) {
  const result = await query(
    `
      UPDATE payments
      SET
        "appointmentId" = $2,
        amount = $3,
        method = $4,
        status = $5,
        "paidAt" = $6
      WHERE id = $1
      RETURNING id
    `,
    [id, appointmentId || null, amount, method || null, status || null, paidAt || null]
  );

  if (!result.rowCount) {
    throw new ApiError(404, "Payment not found.");
  }

  return getPaymentById(id);
}
