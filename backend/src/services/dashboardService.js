import { query } from "../db/pool.js";

export async function getDashboardOverview() {
  const [
    patientsResult,
    appointmentsTodayResult,
    monthlyRevenueResult,
    totalExpensesResult,
    revenueTimelineResult,
    appointmentsByDayResult
  ] = await Promise.all([
    query(`SELECT COUNT(*)::int AS total FROM patients`),
    query(`SELECT COUNT(*)::int AS total FROM appointments WHERE appointment_date = CURRENT_DATE`),
    query(`
      SELECT COALESCE(SUM(amount), 0)::float AS total
      FROM payments
      WHERE status = 'paid'
        AND paid_at IS NOT NULL
        AND DATE_TRUNC('month', paid_at) = DATE_TRUNC('month', CURRENT_DATE)
    `),
    query(`
      SELECT COALESCE(SUM(amount), 0)::float AS total
      FROM expenses
    `),
    query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', paid_at), 'Mon YYYY') AS label,
        DATE_TRUNC('month', paid_at)::date AS "periodStart",
        COALESCE(SUM(amount), 0)::float AS revenue
      FROM payments
      WHERE status = 'paid'
        AND paid_at IS NOT NULL
        AND paid_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
      GROUP BY DATE_TRUNC('month', paid_at)
      ORDER BY DATE_TRUNC('month', paid_at) ASC
    `),
    query(`
      SELECT
        TO_CHAR(appointment_date, 'DD Mon') AS label,
        appointment_date AS "date",
        COUNT(*)::int AS total
      FROM appointments
      WHERE appointment_date >= CURRENT_DATE - INTERVAL '6 days'
      GROUP BY appointment_date
      ORDER BY appointment_date ASC
    `)
  ]);

  return {
    kpis: {
      totalPatients: patientsResult.rows[0].total,
      appointmentsToday: appointmentsTodayResult.rows[0].total,
      monthlyRevenue: monthlyRevenueResult.rows[0].total,
      totalExpenses: totalExpensesResult.rows[0].total
    },
    charts: {
      revenueTimeline: revenueTimelineResult.rows,
      appointmentsByDay: appointmentsByDayResult.rows
    }
  };
}
