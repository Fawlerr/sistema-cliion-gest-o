import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Panel } from "./Panel";

const pieColors = ["#2f6f85", "#e8b072", "#5a9d8b", "#eea88c", "#8ba8b2"];

const chartTheme = {
  grid: "rgba(47,111,133,0.08)",
  axis: "#7c96a2",
  tooltipBg: "#fffdfa",
  tooltipBorder: "rgba(47,111,133,0.12)"
};

export function ChartsSection({ charts }) {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Panel title="Agenda da semana" subtitle="Evolução do volume de atendimentos">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={charts.appointmentsTrend}>
              <CartesianGrid stroke={chartTheme.grid} vertical={false} />
              <XAxis dataKey="day" stroke={chartTheme.axis} tickLine={false} axisLine={false} />
              <YAxis stroke={chartTheme.axis} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: chartTheme.tooltipBg,
                  border: `1px solid ${chartTheme.tooltipBorder}`,
                  borderRadius: 16
                }}
              />
              <Line type="monotone" dataKey="appointments" stroke="#2f6f85" strokeWidth={3} dot={{ r: 4, fill: "#e8b072" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Receita mensal" subtitle="Panorama de entrada ao longo do semestre">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.revenueMonthly}>
              <CartesianGrid stroke={chartTheme.grid} vertical={false} />
              <XAxis dataKey="month" stroke={chartTheme.axis} tickLine={false} axisLine={false} />
              <YAxis stroke={chartTheme.axis} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: chartTheme.tooltipBg,
                  border: `1px solid ${chartTheme.tooltipBorder}`,
                  borderRadius: 16
                }}
              />
              <Bar dataKey="revenue" radius={[12, 12, 0, 0]} fill="#2f6f85" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Distribuição de serviços" subtitle="Tratamentos mais procurados">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={charts.servicesDistribution} cx="50%" cy="50%" innerRadius={58} outerRadius={92} dataKey="value" paddingAngle={3}>
                {charts.servicesDistribution.map((entry, index) => (
                  <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: chartTheme.tooltipBg,
                  border: `1px solid ${chartTheme.tooltipBorder}`,
                  borderRadius: 16
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}
