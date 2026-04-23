import { useMemo } from "react";
import { useApi } from "../hooks/useApi";
import { getCollection } from "../lib/api";
import { formatCurrency, formatDateTime } from "../lib/formatters";
import { Badge } from "../components/Badge";
import { DataTable } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { Panel } from "../components/Panel";
import { StatCard } from "../components/StatCard";

export function PaymentsPage() {
  const { data, isLoading, error } = useApi((signal) => getCollection("/payments", { signal }), []);

  const totals = useMemo(() => {
    const payments = data?.data || [];

    return payments.reduce(
      (accumulator, payment) => {
        const amount = Number(payment.amount || 0);
        accumulator.total += amount;

        if (String(payment.status).toLowerCase() === "paid") {
          accumulator.paid += amount;
        } else {
          accumulator.pending += amount;
        }

        return accumulator;
      },
      { total: 0, paid: 0, pending: 0 }
    );
  }, [data]);

  if (isLoading) {
    return <LoadingState label="Carregando pagamentos..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard title="Volume total de pagamentos" value={totals.total} type="currency" accent="from-violet-500 via-indigo-500 to-sky-400" />
        <StatCard title="Valor pago" value={totals.paid} type="currency" accent="from-emerald-400 via-cyan-400 to-sky-400" />
        <StatCard title="Valor pendente" value={totals.pending} type="currency" accent="from-amber-400 via-orange-400 to-rose-500" />
      </section>

      <Panel title="Pagamentos" subtitle={`${data.meta.count} pagamentos com dados unidos de atendimento e paciente.`}>
        <DataTable
          rows={data.data}
          emptyState={
            <EmptyState
              title="Nenhum pagamento encontrado"
              description="Conforme os pagamentos forem registrados no banco, eles aparecerao aqui com o contexto do atendimento."
            />
          }
          columns={[
            {
              key: "appointmentId",
              header: "Referencia do atendimento",
              render: (row) => (
                <div>
                  <p className="font-semibold text-white">#{row.appointmentId}</p>
                  <p className="mt-1 text-xs text-[color:var(--text-muted)]">{row.patientName}</p>
                </div>
              )
            },
            {
              key: "amount",
              header: "Valor",
              render: (row) => formatCurrency(row.amount)
            },
            {
              key: "method",
              header: "Metodo",
              render: (row) => <span className="capitalize text-white/90">{row.method}</span>
            },
            {
              key: "status",
              header: "Status",
              render: (row) => <Badge value={row.status} />
            },
            {
              key: "appointmentDate",
              header: "Horario do servico",
              render: (row) => (
                <div>
                  <p>{formatDateTime(row.appointmentDate, row.appointmentTime)}</p>
                  <p className="mt-1 text-xs text-[color:var(--text-muted)]">{row.serviceName}</p>
                </div>
              )
            }
          ]}
        />
      </Panel>
    </div>
  );
}
