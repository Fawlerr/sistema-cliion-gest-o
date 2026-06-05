import { useMemo, useState } from "react";
import { Pencil, PlusCircle } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { apiRequest, getCollection } from "../lib/api";
import { formatCurrency } from "../lib/formatters";
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
    description: "",
    price: "",
    durationMinutes: ""
  };
}

export function ServicesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(buildInitialForm());
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const services = useApi((signal) => getCollection("/services", { signal }), []);
  const serviceCards = useMemo(() => services.data?.data || [], [services.data]);

  function openCreateModal() {
    setForm(buildInitialForm());
    setSubmitError("");
    setIsModalOpen(true);
  }

  function openEditModal(service) {
    setForm({
      id: service.id,
      name: service.name || "",
      description: service.description || "",
      price: service.price || "",
      durationMinutes: service.durationMinutes || ""
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

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setSubmitError("");

    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : null
      };

      let response;

      if (form.id) {
        response = await apiRequest(`/services/${form.id}`, {
          method: "PUT",
          body: payload
        });
      } else {
        response = await apiRequest("/services", {
          method: "POST",
          body: payload
        });
      }

      const savedService = response.data;

      services.setData((current) => {
        if (!current) {
          return current;
        }

        const exists = current.data.some((service) => service.id === savedService.id);
        const nextData = exists
          ? current.data.map((service) => (service.id === savedService.id ? savedService : service))
          : [savedService, ...current.data];

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
      services.refresh();
    } catch (error) {
      setSubmitError(error.message || "Não foi possível salvar o serviço.");
    } finally {
      setIsSaving(false);
    }
  }

  if (services.isLoading) {
    return <LoadingState label="Carregando serviços..." />;
  }

  if (services.error) {
    return <ErrorState message={services.error} />;
  }

  return (
    <div className="space-y-6">
      <SectionToolbar
        title="Serviços"
        subtitle={`${services.data.meta.count} serviços disponíveis para cadastro e edição.`}
        actions={
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-[color:var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <PlusCircle size={18} />
            Adicionar serviço
          </button>
        }
      />

      {serviceCards.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {serviceCards.map((service) => (
            <EntityCard
              key={service.id}
              title={service.name}
              subtitle={service.description || "Sem descrição"}
              meta={[
                { label: "Preço", value: formatCurrency(service.price) },
                { label: "Duração", value: service.durationMinutes ? `${service.durationMinutes} min` : "-" }
              ]}
              actions={
                <button
                  type="button"
                  onClick={() => openEditModal(service)}
                  className="rounded-2xl border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10"
                >
                  <Pencil size={16} />
                </button>
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState title="Nenhum serviço encontrado" description="Cadastre um serviço para começar a montar o catálogo da clínica." />
      )}

      <Modal
        open={isModalOpen}
        title={form.id ? "Editar serviço" : "Novo serviço"}
        subtitle="Mantenha o catálogo sempre atualizado com preço, duração e descrição."
        onClose={closeModal}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Nome do serviço">
              <input
                type="text"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
                required
              />
            </FormField>

            <FormField label="Preço">
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(event) => updateField("price", event.target.value)}
                className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
                required
              />
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Duração em minutos">
              <input
                type="number"
                value={form.durationMinutes}
                onChange={(event) => updateField("durationMinutes", event.target.value)}
                className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
              />
            </FormField>

            <FormField label="Descrição">
              <input
                type="text"
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
              />
            </FormField>
          </div>

          {submitError ? <p className="text-sm text-rose-300">{submitError}</p> : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-2xl bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {isSaving ? "Salvando..." : form.id ? "Salvar alterações" : "Criar serviço"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
