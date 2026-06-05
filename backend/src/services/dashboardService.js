import { query } from "../db/pool.js";

export async function getDashboardOverview() {
  // Removemos as consultas nas tabelas 'payments' e 'expenses' temporariamente
  const [
    patientsResult,
    appointmentsTodayResult,
    appointmentsByDayResult
  ] = await Promise.all([
    query(`SELECT COUNT(*)::int AS total FROM patients`),
    query(`SELECT COUNT(*)::int AS total FROM appointments WHERE "appointmentDate" = CURRENT_DATE`),
    query(`
      SELECT
        TO_CHAR("appointmentDate", 'DD Mon') AS label,
        "appointmentDate" AS "date",
        COUNT(*)::int AS total
      FROM appointments
      WHERE "appointmentDate" >= CURRENT_DATE - INTERVAL '6 days'
      GROUP BY "appointmentDate"
      ORDER BY "appointmentDate" ASC
    `)
  ]);

  return {
    kpis: {
      totalPatients: patientsResult.rows[0].total,
      appointmentsToday: appointmentsTodayResult.rows[0].total,
      monthlyRevenue: 0, // Bypass temporário: Retornando 0 para não quebrar a tela
      totalExpenses: 0   // Bypass temporário: Retornando 0 para não quebrar a tela
    },
    charts: {
      revenueTimeline: [], // Bypass temporário: Gráfico financeiro vazio
      appointmentsByDay: appointmentsByDayResult.rows
    }
  };
}