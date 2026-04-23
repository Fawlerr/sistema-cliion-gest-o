import { useApi } from "../hooks/useApi";
import { getCollection, getResource } from "../lib/api";
import { formatDateTime } from "../lib/formatters";
import { AppointmentsChart, RevenueChart } from "../components/Charts";
import { DataTable } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { Panel } from "../components/Panel";
import { StatCard } from "../components/StatCard";
import { Badge } from "../components/Badge";

export function DashboardPage() {
  const { data, isLoading, error } = useApi(
    async (signal) => {
      const [dashboard, appointments] = await Promise.all([
        getResource("/dashboard", { signal }),
        getCollection("/appointments", { query: { limit: 6 }, signal })
      ]);

      return {
        dashboard,
        appointments: appointments.data
      };
    },
    []
  );

  if (isLoading) {
    return <LoadingState label="Carregando KPIs e graficos do painel..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  const { kpis, charts } = data.dashboard;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <StatCard title="Total de pacientes" value={kpis.totalPatients} accent="from-sky-400 via-cyan-400 to-indigo-500" />
        <StatCard title="Agendamentos hoje" value={kpis.appointmentsToday} accent="from-violet-500 via-fuchsia-500 to-sky-400" />
        <StatCard title="Faturamento mensal" value={kpis.monthlyRevenue} type="currency" accent="from-emerald-400 via-cyan-400 to-sky-500" />
        <StatCard title="Total de despesas" value={kpis.totalExpenses} type="currency" accent="from-amber-400 via-orange-400 to-rose-500" />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel title="Faturamento ao longo do tempo" subtitle="Pagamentos pagos agregados por mes a partir da tabela de pagamentos.">
          <RevenueChart data={charts.revenueTimeline} />
        </Panel>

        <Panel title="Agendamentos por dia" subtitle="Volume diario de marcacoes nos ultimos 7 dias a partir da tabela de agendamentos.">
          <AppointmentsChart data={charts.appointmentsByDay} />
        </Panel>
      </section>

      <Panel title="Proximos agendamentos" subtitle="Registros recentes com dados unidos de paciente, servico e profissional.">
        <DataTable
          rows={data.appointments}
          emptyState={
            <EmptyState
              title="Nenhum agendamento encontrado"
              description="Quando houver agendamentos no banco, eles aparecerao aqui com paciente, servico e status."
            />
          }
          columns={[
            {
              key: "patientName",
              header: "Paciente",
              render: (row) => (
                <div>
                  <p className="font-semibold text-white">{row.patientName}</p>
                  <p className="mt-1 text-xs text-[color:var(--text-muted)]">{row.userName}</p>
                </div>
              )
            },
            {
              key: "serviceName",
              header: "Servico",
              render: (row) => <span className="text-white/90">{row.serviceName}</span>
            },
            {
              key: "appointmentDate",
              header: "Horario",
              render: (row) => formatDateTime(row.appointmentDate, row.appointmentTime)
            },
            {
              key: "status",
              header: "Status",
              render: (row) => <Badge value={row.status} />
            },
            {
              key: "notes",
              header: "Observacoes",
              render: (row) => row.notes || "-"
            }
          ]}
        />
      </Panel>
    </div>
  );
}
