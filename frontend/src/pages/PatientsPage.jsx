import { useEffect, useMemo, useState } from "react";
import { Pencil, PlusCircle, Search } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { apiRequest, getCollection } from "../lib/api";
import { ageToBirthDate, calculateAge, formatDateForInput } from "../lib/formatters";
import { EmptyState } from "../components/EmptyState";
import { EntityCard } from "../components/EntityCard";
import { ErrorState } from "../components/ErrorState";
import { FormField } from "../components/FormField";
import { LoadingState } from "../components/LoadingState";
import { Modal } from "../components/Modal";
import { SectionToolbar } from "../components/SectionToolbar";

function buildInitialForm() {
  return {
    id: null,
    name: "",
    age: "",
    email: "",
    phone: "",
    birthDate: "",
    address: ""
  };
}

export function PatientsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(buildInitialForm());
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  useEffect(() => {
    setSearch(debouncedSearch.trim());
  }, [debouncedSearch]);

  const patients = useApi(
    (signal) => getCollection("/patients", { query: { search }, signal }),
    [search]
  );

  const patientCards = useMemo(() => patients.data?.data || [], [patients.data]);

  function openCreateModal() {
    setForm(buildInitialForm());
    setSubmitError("");
    setIsModalOpen(true);
  }

  function openEditModal(patient) {
    setForm({
      id: patient.id,
      name: patient.name || "",
      age: calculateAge(patient.birthDate),
      email: patient.email || "",
      phone: patient.phone || "",
      birthDate: formatDateForInput(patient.birthDate),
      address: patient.address || ""
    });
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

  function handleAgeChange(value) {
    setForm((current) => ({
      ...current,
      age: value,
      birthDate: value ? ageToBirthDate(value) : ""
    }));
  }

  function handleBirthDateChange(value) {
    setForm((current) => ({
      ...current,
      birthDate: value,
      age: value ? calculateAge(value) : ""
    }));
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    setSearch(searchInput.trim());
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setSubmitError("");

    try {
      const payload = {
        name: form.name,
        age: form.age,
        email: form.email,
        phone: form.phone,
        birthDate: form.birthDate || ageToBirthDate(form.age),
        address: form.address
      };

      let response;

      if (form.id) {
        response = await apiRequest(`/patients/${form.id}`, {
          method: "PUT",
          body: payload
        });
      } else {
        response = await apiRequest("/patients", {
          method: "POST",
          body: payload
        });
      }

      const savedPatient = response.data;

      patients.setData((current) => {
        if (!current) {
          return current;
        }

        const exists = current.data.some((patient) => patient.id === savedPatient.id);
        const nextData = exists
          ? current.data.map((patient) => (patient.id === savedPatient.id ? savedPatient : patient))
          : [savedPatient, ...current.data];

        return {
          ...current,
          data: nextData,
          meta: {
            ...current.meta,
            count: exists ? current.meta.count : current.meta.count + 1
          }
        };
      });

      closeModal();
      patients.refresh();
    } catch (error) {
      setSubmitError(error.message || "Nao foi possivel salvar o paciente.");
    } finally {
      setIsSaving(false);
    }
  }

  if (patients.isLoading) {
    return <LoadingState label="Carregando cadastro de pacientes..." />;
  }

  if (patients.error) {
    return <ErrorState message={patients.error} />;
  }

  return (
    <div className="space-y-6">
      <SectionToolbar
        title="Pacientes"
        subtitle={`${patients.data.meta.count} pacientes carregados do banco de dados.`}
        actions={
          <>
            <form onSubmit={handleSearchSubmit} className="flex min-w-[280px] gap-3">
              <label className="field-shell flex flex-1 items-center gap-3 rounded-2xl px-4 py-3">
                <Search size={18} className="text-[color:var(--accent-secondary)]" />
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
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
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-[color:var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <PlusCircle size={18} />
              Adicionar paciente
            </button>
          </>
        }
      />

      {patientCards.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {patientCards.map((patient) => (
            <EntityCard
              key={patient.id}
              title={patient.name}
              subtitle={patient.email || "Sem e-mail cadastrado"}
              meta={[
                { label: "Telefone", value: patient.phone || "-" },
                { label: "Idade", value: calculateAge(patient.birthDate) || "-" }
              ]}
              actions={
                <button
                  type="button"
                  onClick={() => openEditModal(patient)}
                  className="rounded-2xl border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10"
                >
                  <Pencil size={16} />
                </button>
              }
            >
              <p className="text-sm text-[color:var(--text-soft)]">{patient.address || "Endereco nao informado."}</p>
            </EntityCard>
          ))}
        </div>
      ) : (
        <EmptyState title="Nenhum paciente encontrado" description="Cadastre um novo paciente ou ajuste a busca para encontrar registros." />
      )}

      <Modal
        open={isModalOpen}
        title={form.id ? "Editar paciente" : "Novo paciente"}
        subtitle="Os dados informados serao gravados diretamente no PostgreSQL."
        onClose={closeModal}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Nome">
              <input
                type="text"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
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
                onChange={(event) => handleAgeChange(event.target.value)}
                className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
              />
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="E-mail">
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
              />
            </FormField>

            <FormField label="Telefone">
              <input
                type="text"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
              />
            </FormField>
          </div>

          <FormField label="Data de nascimento">
            <input
              type="date"
              value={form.birthDate}
              onChange={(event) => handleBirthDateChange(event.target.value)}
              className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
            />
          </FormField>

          <FormField label="Endereco">
            <textarea
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
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
              {isSaving ? "Salvando..." : form.id ? "Salvar alteracoes" : "Criar paciente"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
