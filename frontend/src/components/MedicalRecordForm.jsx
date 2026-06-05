import { useEffect, useMemo, useState } from "react";
import { FilePlus2 } from "lucide-react";
import { FormField } from "./FormField";
import { Modal } from "./Modal";
import { getMedicalRecordFieldsByType, getMedicalRecordTypeOptions } from "../lib/medicalRecords";

function buildInitialForm() {
  return {
    type: "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
    data: {}
  };
}

export function MedicalRecordForm({ open, onClose, onSubmit, isSaving, submitError }) {
  const [form, setForm] = useState(buildInitialForm());
  const typeOptions = useMemo(() => getMedicalRecordTypeOptions(), []);
  const dynamicFields = useMemo(() => getMedicalRecordFieldsByType(form.type), [form.type]);

  useEffect(() => {
    if (!open) {
      setForm(buildInitialForm());
    }
  }, [open]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateDynamicField(field, value) {
    setForm((current) => ({
      ...current,
      data: {
        ...current.data,
        [field]: value
      }
    }));
  }

  function handleTypeChange(value) {
    setForm((current) => ({
      ...current,
      type: value,
      data: {}
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit(form);
  }

  return (
    <Modal
      open={open}
      title="Novo prontuário"
      subtitle="Formulário único e dinâmico. O tipo selecionado define os campos específicos do registro."
      onClose={onClose}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Tipo do prontuário">
            <select
              value={form.type}
              onChange={(event) => handleTypeChange(event.target.value)}
              className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
              required
            >
              <option value="">Selecione um tipo</option>
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Data">
            <input
              type="date"
              value={form.date}
              onChange={(event) => updateField("date", event.target.value)}
              className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
              required
            />
          </FormField>
        </div>

        <FormField label="Observações gerais">
          <textarea
            rows={3}
            value={form.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
          />
        </FormField>

        {form.type ? (
          <div className="grid gap-4">
            {dynamicFields.map((field) => (
              <FormField key={field.name} label={field.label}>
                {field.type === "textarea" ? (
                  <textarea
                    rows={4}
                    value={form.data[field.name] || ""}
                    onChange={(event) => updateDynamicField(field.name, event.target.value)}
                    className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={form.data[field.name] || ""}
                    onChange={(event) => updateDynamicField(field.name, event.target.value)}
                    className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
                  />
                )}
              </FormField>
            ))}
          </div>
        ) : (
          <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-[color:var(--text-soft)]">
            Selecione o tipo do prontuário para carregar os campos dinâmicos.
          </div>
        )}

        {submitError ? <p className="text-sm text-rose-300">{submitError}</p> : null}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-2xl bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            <FilePlus2 size={16} />
            {isSaving ? "Salvando..." : "Salvar prontuário"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
