import { Printer } from "lucide-react";
import { formatDate } from "../lib/formatters";
import { getMedicalRecordSections, getMedicalRecordTypeLabel } from "../lib/medicalRecords";
import { Modal } from "./Modal";

export function MedicalRecordPreview({ open, onClose, patient, record, onDownloadPDF }) {
  if (!record) {
    return null;
  }

  const sections = getMedicalRecordSections(record);

  function handlePrint() {
    if (onDownloadPDF) {
      onDownloadPDF(record);
    } else {
      window.print();
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={getMedicalRecordTypeLabel(record.type)}
      subtitle={`${patient?.name || "Paciente"} • ${formatDate(record.date)}`}
    >
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-2xl bg-[color:var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Printer size={16} />
            Imprimir / Baixar PDF
          </button>
        </div>

        {sections.length ? (
          sections.map((section) => (
            <section key={section.title} className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                {section.title}
              </h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/90">{section.value}</p>
            </section>
          ))
        ) : (
          <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-5 text-sm text-[color:var(--text-soft)]">
            Nenhum conteúdo detalhado registrado neste prontuário.
          </div>
        )}
      </div>
    </Modal>
  );
}
