import { useMemo, useState } from "react";
import { Pencil, PlusCircle } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { apiRequest, getCollection } from "../lib/api";
import { formatCurrency, formatDate, formatDateForInput, formatDateTime } from "../lib/formatters";
import { Badge } from "../components/Badge";
import { EmptyState } from "../components/EmptyState";
import { EntityCard } from "../components/EntityCard";
import { ErrorState } from "../components/ErrorState";
import { FormField } from "../components/FormField";
import { LoadingState } from "../components/LoadingState";
import { Modal } from "../components/Modal";
import { SectionToolbar } from "../components/SectionToolbar";
import { StatCard } from "../components/StatCard";

function buildInitialEntry() {
  return {
    id: null,
    type: "payment",
    appointmentId: "",
    amount: "",
    method: "pix",
    status: "paid",
    paidAt: "",
    description: "",
    expenseDate: ""
  };
}

export function BillingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(buildInitialEntry());
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const billing = useApi((signal) => getCollection("/billing", { signal }), []);
  const appointments = useApi((signal) => getCollection("/appointments", { query: { limit: 500 }, signal }), []);

  const summary = useMemo(() => {
    const entries = billing.data?.data || [];
    const totals = entries.reduce(
      (acc, entry) => {
        const amount = Number(entry.amount || 0);
        if (entry.type === "payment") {
          acc.payments += amount;
        } else {
          acc.expenses += amount;
        }
        return acc;
      },
      { payments: 0, expenses: 0 }
    );

    return {
      ...totals,
      profit: totals.payments - totals.expenses
    };
  }, [billing.data]);

  function openModal() {
    setForm(buildInitialEntry());
    setSubmitError("");
    setIsModalOpen(true);
  }

  function openEditModal(entry) {
    if (entry.type === "payment") {
      setForm({
        id: entry.id,
        type: "payment",
        appointmentId: entry.appointmentId ? String(entry.appointmentId) : "",
        amount: entry.amount ?? "",
        method: entry.method || "pix",
        status: entry.status || "paid",
        paidAt: formatDateForInput(entry.paidAt),
        description: "",
        expenseDate: ""
      });
    } else {
      setForm({
        id: entry.id,
        type: "expense",
        appointmentId: "",
        amount: entry.amount ?? "",
        method: "pix",
        status: "paid",
        paidAt: "",
        description: entry.description || "",
        expenseDate: formatDateForInput(entry.expenseDate)
      });
    }

    setSubmitError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setSubmitError("");
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setSubmitError("");

    try {
      const payload =
        form.type === "payment"
          ? {
              appointmentId: form.appointmentId,
              amount: Number(form.amount),
              method: form.method,
              status: form.status,
              paidAt: form.paidAt ? `${form.paidAt}T12:00:00` : null
            }
          : {
              type: "expense",
              description: form.description,
              amount: Number(form.amount),
              expenseDate: form.expenseDate
            };

      const path =
        form.type === "payment"
          ? form.id
            ? `/payments/${form.id}`
            : "/billing"
          : form.id
            ? `/expenses/${form.id}`
            : "/billing";

      await apiRequest(path, {
        method: form.id ? "PUT" : "POST",
        body: form.id ? payload : { ...payload, type: form.type }
      });

      closeModal();
      billing.refresh();
    } catch (error) {
      setSubmitError(error.message || "Nao foi possivel salvar a entrada.");
    } finally {
      setIsSaving(false);
    }
  }

  if (billing.isLoading || appointments.isLoading) {
    return <LoadingState label="Carregando faturamento..." />;
  }

  if (billing.error) {
    return <ErrorState message={billing.error} />;
  }

  if (appointments.error) {
    return <ErrorState message={appointments.error} />;
  }

  return (
    <div className="space-y-6">
      <SectionToolbar
        title="Faturamento"
        subtitle="Acompanhe receitas e despesas em um unico fluxo operacional."
        actions={
          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-[color:var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <PlusCircle size={18} />
            Adicionar entrada
          </button>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total de despesas" value={summary.expenses} type="currency" accent="from-rose-500 via-orange-400 to-amber-300" />
        <StatCard title="Total de pagamentos" value={summary.payments} type="currency" accent="from-emerald-400 via-cyan-400 to-sky-500" />
        <StatCard title="Lucro" value={summary.profit} type="currency" accent="from-violet-500 via-indigo-500 to-sky-400" />
      </section>

      {billing.data.data.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {billing.data.data.map((entry) => (
            <EntityCard
              key={entry.entryId}
              title={entry.type === "payment" ? "Pagamento" : "Despesa"}
              subtitle={entry.description}
              meta={[
                { label: "Valor", value: formatCurrency(entry.amount) },
                { label: "Data", value: formatDate(entry.entryDate) }
              ]}
              actions={
                <div className="flex items-center gap-2">
                  {entry.status ? <Badge value={entry.status} /> : null}
                  <button
                    type="button"
                    onClick={() => openEditModal(entry)}
                    className="rounded-2xl border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10"
                  >
                    <Pencil size={16} />
                  </button>
                </div>
              }
            >
              <div className="space-y-2 text-sm text-[color:var(--text-soft)]">
                {entry.method ? <p>Metodo: <span className="text-white">{entry.method}</span></p> : null}
                {entry.appointmentId ? <p>Atendimento: <span className="text-white">#{entry.appointmentId}</span></p> : null}
              </div>
            </EntityCard>
          ))}
        </div>
      ) : (
        <EmptyState title="Nenhum lancamento encontrado" description="Adicione um pagamento ou despesa para iniciar o faturamento." />
      )}

      <Modal
        open={isModalOpen}
        title={form.id ? "Editar entrada de faturamento" : "Nova entrada de faturamento"}
        subtitle="Escolha se deseja registrar um pagamento ou uma despesa."
        onClose={closeModal}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Tipo">
              <select
                value={form.type}
                onChange={(event) => updateField("type", event.target.value)}
                className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
                disabled={Boolean(form.id)}
              >
                <option value="payment">Pagamento</option>
                <option value="expense">Despesa</option>
              </select>
            </FormField>

            <FormField label="Valor">
              <input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(event) => updateField("amount", event.target.value)}
                className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
                required
              />
            </FormField>
          </div>

          {form.type === "payment" ? (
            <>
              <FormField label="Atendimento">
                <select
                  value={form.appointmentId}
                  onChange={(event) => updateField("appointmentId", event.target.value)}
                  className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
                  required
                >
                  <option value="">Selecione um atendimento</option>
                  {appointments.data.data.map((appointment) => (
                    <option key={appointment.id} value={appointment.id}>
                      {appointment.patientName} - {appointment.serviceName} - {formatDateTime(appointment.appointmentDate, appointment.appointmentTime)}
                    </option>
                  ))}
                </select>
              </FormField>

              <div className="grid gap-4 md:grid-cols-3">
                <FormField label="Metodo">
                  <select
                    value={form.method}
                    onChange={(event) => updateField("method", event.target.value)}
                    className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
                  >
                    <option value="pix">Pix</option>
                    <option value="card">Cartao</option>
                    <option value="boleto">Boleto</option>
                    <option value="cash">Dinheiro</option>
                  </select>
                </FormField>

                <FormField label="Status">
                  <select
                    value={form.status}
                    onChange={(event) => updateField("status", event.target.value)}
                    className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
                  >
                    <option value="paid">Pago</option>
                    <option value="pending">Pendente</option>
                  </select>
                </FormField>

                <FormField label="Data do pagamento">
                  <input
                    type="date"
                    value={form.paidAt}
                    onChange={(event) => updateField("paidAt", event.target.value)}
                    className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
                  />
                </FormField>
              </div>
            </>
          ) : (
            <>
              <FormField label="Descricao">
                <input
                  type="text"
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
                  required
                />
              </FormField>

              <FormField label="Data da despesa">
                <input
                  type="date"
                  value={form.expenseDate}
                  onChange={(event) => updateField("expenseDate", event.target.value)}
                  className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
                  required
                />
              </FormField>
            </>
          )}

          {submitError ? <p className="text-sm text-rose-300">{submitError}</p> : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-2xl bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {isSaving ? "Salvando..." : form.id ? "Salvar alteracoes" : "Salvar entrada"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
