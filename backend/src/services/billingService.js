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
      COALESCE(pay."paidAt"::date, a."appointmentDate", pay."createdAt"::date) AS "entryDate",
      pay."paidAt",
      NULL::date AS "expenseDate",
      pay.method,
      pay.status,
      pay."appointmentId"
    FROM payments pay
    LEFT JOIN appointments a ON a.id = pay."appointmentId"
    LEFT JOIN patients p ON p.id = a."patientId"
    LEFT JOIN services s ON s.id = a."serviceId"

    UNION ALL

    SELECT
      CONCAT('expense-', e.id) AS "entryId",
      'expense' AS type,
      e.id,
      e.amount,
      e.description,
      e."expenseDate" AS "entryDate",
      NULL::timestamp AS "paidAt",
      e."expenseDate",
      NULL AS method,
      NULL AS status,
      NULL AS "appointmentId"
    FROM expenses e

    ORDER BY "entryDate" DESC, "entryId" DESC
  `);

  return result.rows;
}
