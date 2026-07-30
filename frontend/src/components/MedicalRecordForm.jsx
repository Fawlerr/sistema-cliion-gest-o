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

  function toggleCheckboxOption(fieldName, option) {
    setForm((current) => {
      const currentList = Array.isArray(current.data[fieldName]) ? current.data[fieldName] : [];
      const updatedList = currentList.includes(option)
        ? currentList.filter((item) => item !== option)
        : [...currentList, option];

      return {
        ...current,
        data: {
          ...current.data,
          [fieldName]: updatedList
        }
      };
    });
  }

  function renderFieldInput(field) {
    const value = form.data[field.name];

    if (field.type === "scale") {
      const currentScale = Number(value ?? 0);
      return (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {Array.from({ length: 11 }).map((_, idx) => {
            const isSelected = value !== undefined && value !== null && String(value) === String(idx);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => updateDynamicField(field.name, idx)}
                className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-sm transition ${
                  isSelected
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                    : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {idx}
              </button>
            );
          })}
        </div>
      );
    }

    if (field.type === "checkbox-group") {
      const selectedList = Array.isArray(value) ? value : [];
      return (
        <div className="grid gap-2 sm:grid-cols-2 pt-1">
          {field.options.map((option) => {
            const checked = selectedList.includes(option);
            return (
              <label
                key={option}
                onClick={() => toggleCheckboxOption(field.name, option)}
                className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs font-medium cursor-pointer transition select-none ${
                  checked
                    ? "border-teal-500/40 bg-teal-500/10 text-teal-300"
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {}}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-teal-500 focus:ring-0"
                />
                <span>{option}</span>
              </label>
            );
          })}
        </div>
      );
    }

    if (field.type === "select") {
      return (
        <select
          value={value || ""}
          onChange={(event) => updateDynamicField(field.name, event.target.value)}
          className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
        >
          <option value="">Selecione uma opção</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "textarea") {
      return (
        <textarea
          rows={3}
          value={value || ""}
          onChange={(event) => updateDynamicField(field.name, event.target.value)}
          className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
        />
      );
    }

    return (
      <input
        type="text"
        value={value || ""}
        onChange={(event) => updateDynamicField(field.name, event.target.value)}
        className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
      />
    );
  }

  return (
    <Modal
      open={open}
      title="Novo prontuário / Ficha de Avaliação"
      subtitle="Selecione o tipo de atendimento para carregar os campos específicos do prontuário."
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
            rows={2}
            value={form.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
          />
        </FormField>

        {form.type ? (
          <div className="max-h-[55vh] overflow-y-auto pr-1 space-y-4">
            {dynamicFields.map((field) => (
              <FormField key={field.name} label={field.label}>
                {renderFieldInput(field)}
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
