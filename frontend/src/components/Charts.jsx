import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const axisStyle = { stroke: "#8f9ad1", fontSize: 12 };
const gridStroke = "rgba(143, 154, 209, 0.14)";

export function RevenueChart({ data }) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.56} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={gridStroke} vertical={false} />
          <XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} />
          <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ background: "rgba(8, 12, 29, 0.94)", border: "1px solid rgba(124,130,255,0.24)", borderRadius: 16 }} />
          <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fill="url(#revenueGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AppointmentsChart({ data }) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke={gridStroke} vertical={false} />
          <XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} />
          <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ background: "rgba(8, 12, 29, 0.94)", border: "1px solid rgba(124,130,255,0.24)", borderRadius: 16 }} />
          <Bar dataKey="total" radius={[10, 10, 0, 0]} fill="#38bdf8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
