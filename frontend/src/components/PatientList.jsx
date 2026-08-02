import { ClipboardList, CreditCard, FileText, Pencil, Search, Trash2, UserRound } from "lucide-react";
import { calculateAge } from "../lib/formatters";
import { EmptyState } from "./EmptyState";
import { EntityCard } from "./EntityCard";
import { FormField } from "./FormField";
import { Modal } from "./Modal";
import { SectionToolbar } from "./SectionToolbar";

export function PatientList({
  patients,
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  onOpenCreate,
  onOpenEdit,
  onDeletePatient,
  onViewDetails,
  isModalOpen,
  form,
  onCloseModal,
  onUpdateField,
  onAgeChange,
  onBirthDateChange,
  onSubmit,
  submitError,
  isSaving
}) {
  return (
    <div className="space-y-6">
      <SectionToolbar
        title="Pacientes"
        subtitle={`${patients.length} pacientes carregados com acesso rápido a detalhes, prontuários, pagamentos e avaliações.`}
        actions={
          <>
            <form onSubmit={onSearchSubmit} className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
              <label className="field-shell flex flex-1 items-center gap-3 rounded-2xl px-4 py-3">
                <Search size={18} className="text-[color:var(--accent-secondary)]" />
                <input
                  value={searchInput}
                  onChange={(event) => onSearchInputChange(event.target.value)}
                  placeholder="Buscar por nome, e-mail ou telefone"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[color:var(--text-muted)]"
                />
              </label>
              <button
                type="submit"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Buscar
              </button>
            </form>
            <button
              type="button"
              onClick={onOpenCreate}
              className="inline-flex items-center gap-2 rounded-2xl bg-[color:var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <UserRound size={18} />
              Adicionar paciente
            </button>
          </>
        }
      />

      {submitError && !isModalOpen ? <p className="text-sm text-rose-300">{submitError}</p> : null}

      {patients.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {patients.map((patient) => (
            <EntityCard
              key={patient.id}
              title={patient.name}
              subtitle={patient.email || "Sem e-mail cadastrado"}
              meta={[
                { label: "Telefone", value: patient.phone || "-" },
                { label: "Idade", value: calculateAge(patient.birthDate) || "-" }
              ]}
              actions={
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenEdit(patient)}
                    className="rounded-2xl border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10"
                    title="Editar paciente"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeletePatient(patient)}
                    className="rounded-2xl border border-rose-300/20 bg-rose-500/10 p-2 text-rose-200 transition hover:bg-rose-500/20"
                    title="Excluir paciente"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              }
            >
              <p className="text-sm text-[color:var(--text-soft)]">{patient.address || "Endereço não informado."}</p>

              <div className="mt-5 grid gap-3">
                <button
                  type="button"
                  onClick={() => onViewDetails(patient.id, "records")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[color:var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  <FileText size={16} />
                  Ver detalhes
                </button>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => onViewDetails(patient.id, "records")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--text-soft)] transition hover:bg-white/[0.08] hover:text-white"
                  >
                    <ClipboardList size={14} />
                    Prontuários
                  </button>
                  <button
                    type="button"
                    onClick={() => onViewDetails(patient.id, "payments")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--text-soft)] transition hover:bg-white/[0.08] hover:text-white"
                  >
                    <CreditCard size={14} />
                    Pagamentos
                  </button>
                </div>
              </div>
            </EntityCard>
          ))}
        </div>
      ) : (
        <EmptyState title="Nenhum paciente encontrado" description="Cadastre um novo paciente ou ajuste a busca para encontrar registros." />
      )}

      <Modal
        open={isModalOpen}
        title={form.id ? "Editar paciente" : "Novo paciente"}
        subtitle="Informe os dados do paciente para atualização cadastral."
        onClose={onCloseModal}
      >
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Nome">
              <input
                type="text"
                value={form.name}
                onChange={(event) => onUpdateField("name", event.target.value)}
                className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
                required
              />
            </FormField>

            <FormField label="Idade">
              <input
                type="number"
                min="0"
                max="130"
                value={form.age}
                onChange={(event) => onAgeChange(event.target.value)}
                className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
              />
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="E-mail">
              <input
                type="email"
                value={form.email}
                onChange={(event) => onUpdateField("email", event.target.value)}
                className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
              />
            </FormField>

            <FormField label="Telefone">
              <input
                type="text"
                value={form.phone}
                onChange={(event) => onUpdateField("phone", event.target.value)}
                className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
              />
            </FormField>
          </div>

          <FormField label="Data de nascimento">
            <input
              type="date"
              value={form.birthDate}
              onChange={(event) => onBirthDateChange(event.target.value)}
              className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
            />
          </FormField>

          <FormField label="Endereço">
            <textarea
              value={form.address}
              onChange={(event) => onUpdateField("address", event.target.value)}
              rows={3}
              className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
            />
          </FormField>

          {submitError ? <p className="text-sm text-rose-300">{submitError}</p> : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-2xl bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {isSaving ? "Salvando..." : form.id ? "Salvar alterações" : "Criar paciente"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
