import { useMemo, useRef, useState } from "react";
import { Download, Eye, PlusCircle } from "lucide-react";
import { buildMedicalRecordSummary, createMedicalRecord, getMedicalRecordTypeLabel } from "../lib/medicalRecords";
import { formatDate } from "../lib/formatters";
import { EmptyState } from "./EmptyState";
import { MedicalRecordForm } from "./MedicalRecordForm";
import { MedicalRecordPDF } from "./MedicalRecordPDF";
import { MedicalRecordPreview } from "./MedicalRecordPreview";
import { Panel } from "./Panel";

function slugifyFilePart(value) {
  return String(value || "prontuario")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export function MedicalRecordsSection({ patientId, patientName, patient, records, onRecordsChange }) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [previewRecord, setPreviewRecord] = useState(null);
  const [pdfRecord, setPdfRecord] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pdfContainerRef = useRef(null);

  const orderedRecords = useMemo(
    () => [...records].sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime()),
    [records]
  );

  async function handleCreateRecord(form) {
    setIsSaving(true);
    setSubmitError("");

    try {
      const createdRecord = await createMedicalRecord({
        patientId,
        type: form.type,
        date: form.date,
        notes: form.notes,
        data: form.data
      });

      onRecordsChange((current) => [createdRecord, ...current]);
      setOpen(false);
    } catch (error) {
      setSubmitError(error.message || "Não foi possível salvar o prontuário.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDownloadPDF(record) {
    setPdfRecord(record);
    setIsGeneratingPdf(true);

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 60));
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default || html2pdfModule;
      const fileName = `prontuario-${slugifyFilePart(patient.name)}-${String(record.date).slice(0, 10)}.pdf`;

      await html2pdf()
        .set({
          margin: 0,
          filename: fileName,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff"
          },
          jsPDF: {
            unit: "pt",
            format: "a4",
            orientation: "portrait"
          },
          pagebreak: { mode: ["css", "legacy"] }
        })
        .from(pdfContainerRef.current)
        .save();
    } finally {
      setIsGeneratingPdf(false);
      setPdfRecord(null);
    }
  }

  return (
    <div className="space-y-5">
      <Panel
        title="Prontuários"
        subtitle={`Prontuários e registros clínicos de ${patientName} organizados por data de atendimento.`}
        actions={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-[color:var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <PlusCircle size={16} />
            Novo prontuário
          </button>
        }
      >
        {orderedRecords.length ? (
          <div className="grid gap-4">
            {orderedRecords.map((record) => (
              <article
                key={record.id}
                className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_42px_rgba(5,8,22,0.16)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200/80">
                      {getMedicalRecordTypeLabel(record.type)}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-white">{formatDate(record.date)}</h3>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-[color:var(--text-soft)]">
                    {record.type}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-7 text-[color:var(--text-soft)]">
                  {buildMedicalRecordSummary(record)}
                </p>

                {record.notes ? (
                  <div className="mt-4 rounded-[18px] border border-white/8 bg-slate-950/20 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                      Observações gerais
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-200/90">{record.notes}</p>
                  </div>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setPreviewRecord(record)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-[color:var(--text-soft)] transition hover:bg-white/[0.08] hover:text-white"
                  >
                    <Eye size={16} />
                    Ver
                  </button>
                  <button
                    type="button"
                    disabled={isGeneratingPdf}
                    onClick={() => handleDownloadPDF(record)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[color:var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Download size={16} />
                    {isGeneratingPdf && pdfRecord?.id === record.id ? "Gerando PDF..." : "Baixar PDF"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhum prontuário registrado"
            description="Crie o primeiro prontuário para centralizar avaliações, evoluções e demais registros clínicos do paciente em um único fluxo."
          />
        )}
      </Panel>

      <MedicalRecordForm
        open={open}
        onClose={() => {
          setOpen(false);
          setSubmitError("");
        }}
        onSubmit={handleCreateRecord}
        isSaving={isSaving}
        submitError={submitError}
      />

      <MedicalRecordPreview
        open={Boolean(previewRecord)}
        onClose={() => setPreviewRecord(null)}
        patient={patient}
        record={previewRecord}
        onDownloadPDF={handleDownloadPDF}
      />

      <div
        style={{
          position: "fixed",
          left: "-99999px",
          top: 0,
          pointerEvents: "none"
        }}
      >
        {pdfRecord ? (
          <div ref={pdfContainerRef}>
            <MedicalRecordPDF patient={patient} record={pdfRecord} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
