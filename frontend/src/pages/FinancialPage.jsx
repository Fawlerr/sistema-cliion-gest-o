import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Panel } from "../components/Panel";

export function FinancialPage({ financial }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
      <Panel title="Receita x despesas" subtitle="Comparativo mensal de desempenho">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={financial.monthlyOverview}>
              <CartesianGrid stroke="rgba(47,111,133,0.08)" vertical={false} />
              <XAxis dataKey="month" stroke="#7c96a2" tickLine={false} axisLine={false} />
              <YAxis stroke="#7c96a2" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#fffdfa",
                  border: "1px solid rgba(47,111,133,0.12)",
                  borderRadius: 16
                }}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#2f6f85" radius={[10, 10, 0, 0]} />
              <Bar dataKey="expenses" fill="#e8b072" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Resumo de lucro" subtitle="Resultado operacional consolidado">
        <div className="space-y-4">
          <div className="rounded-[24px] bg-[linear-gradient(135deg,#2f6f85,#214f62)] p-5 text-white">
            <p className="text-sm font-medium uppercase tracking-[0.24em]">Lucro</p>
            <h3 className="mt-3 text-4xl font-bold">${financial.profit.toLocaleString("en-US")}</h3>
            <p className="mt-2 text-sm font-medium">Margem: {financial.margin}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className="soft-card rounded-[24px] border border-[color:var(--line)] p-5">
              <p className="text-sm text-[color:var(--text-soft)]">Receita total</p>
              <p className="mt-2 text-2xl font-semibold text-[color:var(--accent-deep)]">${financial.totalRevenue.toLocaleString("en-US")}</p>
            </div>

            <div className="soft-card rounded-[24px] border border-[color:var(--line)] p-5">
              <p className="text-sm text-[color:var(--text-soft)]">Despesas totais</p>
              <p className="mt-2 text-2xl font-semibold text-[color:var(--accent-deep)]">${financial.totalExpenses.toLocaleString("en-US")}</p>
            </div>
          </div>
        </div>
      </Panel>

      <div className="xl:col-span-2">
        <Panel title="Tendencia de lucro" subtitle="Area de receita menos despesas">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={financial.monthlyOverview.map((item) => ({
                  ...item,
                  profit: item.revenue - item.expenses
                }))}
              >
                <CartesianGrid stroke="rgba(47,111,133,0.08)" vertical={false} />
                <XAxis dataKey="month" stroke="#7c96a2" tickLine={false} axisLine={false} />
                <YAxis stroke="#7c96a2" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#fffdfa",
                    border: "1px solid rgba(47,111,133,0.12)",
                    borderRadius: 16
                  }}
                />
                <Area type="monotone" dataKey="profit" stroke="#2f6f85" fill="rgba(47,111,133,0.22)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
}
