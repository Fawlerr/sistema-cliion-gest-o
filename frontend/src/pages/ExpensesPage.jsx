import { useMemo } from "react";
import { useApi } from "../hooks/useApi";
import { getCollection } from "../lib/api";
import { formatCurrency, formatDate } from "../lib/formatters";
import { DataTable } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { Panel } from "../components/Panel";
import { StatCard } from "../components/StatCard";

export function ExpensesPage() {
  const { data, isLoading, error } = useApi((signal) => getCollection("/expenses", { signal }), []);

  const total = useMemo(
    () => (data?.data || []).reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
    [data]
  );

  if (isLoading) {
    return <LoadingState label="Carregando despesas..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2">
        <StatCard title="Total de despesas" value={total} type="currency" accent="from-rose-500 via-orange-400 to-amber-300" />
        <StatCard title="Lançamentos de despesas" value={data.meta.count} accent="from-indigo-500 via-violet-500 to-sky-400" />
      </section>

      <Panel title="Despesas" subtitle="Custos operacionais carregados diretamente da tabela de despesas.">
        <DataTable
          rows={data.data}
          emptyState={
            <EmptyState
              title="Nenhuma despesa encontrada"
              description="As despesas aparecerão aqui quando a clínica registrar gastos operacionais."
            />
          }
          columns={[
            {
              key: "description",
              header: "Descrição",
              render: (row) => <span className="font-semibold text-white">{row.description}</span>
            },
            {
              key: "amount",
              header: "Valor",
              render: (row) => formatCurrency(row.amount)
            },
            {
              key: "expenseDate",
              header: "Data",
              render: (row) => formatDate(row.expenseDate)
            }
          ]}
        />
      </Panel>
    </div>
  );
}
