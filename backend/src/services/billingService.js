import { query } from "../db/pool.js";

export async function listBillingEntries() {
  const result = await query(`
    SELECT
      CONCAT('payment-', pay.id) AS "entryId",
      'payment' AS type,
      pay.id,
      pay.amount,
      COALESCE(
        CONCAT('Pagamento de ', COALESCE(p.name, 'Paciente sem nome'), ' - ', COALESCE(s.name, 'Servico')),
        'Pagamento'
      ) AS description,
      COALESCE(pay.paid_at::date, a.appointment_date, pay.created_at::date) AS "entryDate",
      pay.paid_at AS "paidAt",
      NULL::date AS "expenseDate",
      pay.method,
      pay.status,
      pay.appointment_id AS "appointmentId"
    FROM payments pay
    LEFT JOIN appointments a ON a.id = pay.appointment_id
    LEFT JOIN patients p ON p.id = a.patient_id
    LEFT JOIN services s ON s.id = a.service_id

    UNION ALL

    SELECT
      CONCAT('expense-', e.id) AS "entryId",
      'expense' AS type,
      e.id,
      e.amount,
      e.description,
      e.expense_date AS "entryDate",
      NULL::timestamp AS "paidAt",
      e.expense_date AS "expenseDate",
      NULL AS method,
      NULL AS status,
      NULL AS "appointmentId"
    FROM expenses e

    ORDER BY "entryDate" DESC, "entryId" DESC
  `);

  return result.rows;
}
