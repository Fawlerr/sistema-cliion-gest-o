import { useEffect, useState } from "react";
import { Link2 } from "lucide-react";
import { apiRequest } from "../lib/api";
import { FormField } from "./FormField";
import { Modal } from "./Modal";

function buildInitialLinkForm() {
  return {
    patientId: "",
    serviceId: "",
    expiresInHours: "24",
    startHour: "08:00",
    endHour: "18:00",
    slotDuration: "30"
  };
}

export function GenerateLinkModal({ open, onClose, onSuccess, patients = [], services = [] }) {
  const [form, setForm] = useState(buildInitialLinkForm());
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(buildInitialLinkForm());
      setSubmitError("");
      setGeneratedLink(null);
    }
  }, [open]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setSubmitError("");

    try {
      const response = await apiRequest("/appointment-links", {
        method: "POST",
        body: {
          patientId: form.patientId || null,
          serviceId: form.serviceId || null,
          expiresInHours: Number(form.expiresInHours),
          config: {
            startHour: form.startHour,
            endHour: form.endHour,
            slotDuration: Number(form.slotDuration),
            maxUses: 1
          }
        }
      });

      const link = response.data;
      setGeneratedLink(link);
      onSuccess?.(link);
    } catch (error) {
      setSubmitError(error.message || "Falha ao gerar link.");
    } finally {
      setIsSaving(false);
    }
  }

  async function copyLink() {
    if (!generatedLink?.publicUrl) {
      return;
    }

    await navigator.clipboard.writeText(generatedLink.publicUrl);
  }

  return (
    <Modal
      open={open}
      title="Gerar link de agendamento"
      subtitle="Crie um link seguro com expiração para o paciente reservar um horário diretamente."
      onClose={onClose}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Paciente (opcional)">
            <select
              value={form.patientId}
              onChange={(event) => updateField("patientId", event.target.value)}
              className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
            >
              <option value="">Qualquer paciente</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Serviço (opcional)">
            <select
              value={form.serviceId}
              onChange={(event) => updateField("serviceId", event.target.value)}
              className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
            >
              <option value="">Qualquer serviço</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Expira em (horas)">
            <input
              type="number"
              min="1"
              max="720"
              value={form.expiresInHours}
              onChange={(event) => updateField("expiresInHours", event.target.value)}
              className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
              required
            />
          </FormField>

          <FormField label="Duração do slot (min)">
            <input
              type="number"
              min="15"
              max="120"
              value={form.slotDuration}
              onChange={(event) => updateField("slotDuration", event.target.value)}
              className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
            />
          </FormField>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Horário inicial">
            <input
              type="time"
              value={form.startHour}
              onChange={(event) => updateField("startHour", event.target.value)}
              className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
            />
          </FormField>

          <FormField label="Horário final">
            <input
              type="time"
              value={form.endHour}
              onChange={(event) => updateField("endHour", event.target.value)}
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
            {isSaving ? "Gerando..." : "Gerar link"}
          </button>
        </div>

        {generatedLink ? (
          <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
            <p className="font-semibold text-emerald-300">Link gerado com sucesso</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <span className="min-w-0 flex-1 truncate rounded-xl bg-slate-950/30 px-3 py-2 text-sm font-mono text-emerald-100">
                {generatedLink.publicUrl}
              </span>
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/30"
              >
                <Link2 size={16} />
                Copiar
              </button>
            </div>
          </div>
        ) : null}
      </form>
    </Modal>
  );
}
