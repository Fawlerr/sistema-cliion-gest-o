import { query } from "../db/pool.js";
import { ApiError } from "../lib/apiError.js";

const paymentSelect = `
  SELECT
    pay.id,
    pay.appointment_id AS "appointmentId",
    pay.amount,
    pay.method,
    pay.status,
    pay.paid_at AS "paidAt",
    pay.created_at AS "createdAt",
    a.appointment_date AS "appointmentDate",
    a.appointment_time AS "appointmentTime",
    p.id AS "patientId",
    p.name AS "patientName",
    s.id AS "serviceId",
    s.name AS "serviceName"
  FROM payments pay
  LEFT JOIN appointments a ON a.id = pay.appointment_id
  LEFT JOIN patients p ON p.id = a.patient_id
  LEFT JOIN services s ON s.id = a.service_id
`;

export async function listPayments() {
  const result = await query(`${paymentSelect} ORDER BY pay.created_at DESC, pay.id DESC`);
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
      INSERT INTO payments (appointment_id, amount, method, status, paid_at)
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
        appointment_id = $2,
        amount = $3,
        method = $4,
        status = $5,
        paid_at = $6
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
