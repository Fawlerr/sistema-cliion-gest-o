import { getDashboardOverview } from "../services/dashboardService.js";

export async function getDashboard(_req, res) {
  const dashboard = await getDashboardOverview();
  res.json({ data: dashboard });
}
