import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, UserRound } from "lucide-react";
import { formatCurrency, formatDate, calculateAge } from "../lib/formatters";
import { Badge } from "./Badge";
import { DataTable } from "./DataTable";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";
import { MedicalRecordsSection } from "./MedicalRecordsSection";
import { Panel } from "./Panel";
import { PatientTabs } from "./PatientTabs";
import { listMedicalRecords } from "../lib/medicalRecords";

export function PatientDetails({
  patient,
  payments,
  onBack,
  initialTab = "records"
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [isLoadingMedicalRecords, setIsLoadingMedicalRecords] = useState(true);
  const [medicalRecordsError, setMedicalRecordsError] = useState("");

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    let isActive = true;

    if (!patient?.id) {
      return;
    }

    async function loadMedicalRecords() {
      setIsLoadingMedicalRecords(true);
      setMedicalRecordsError("");

      try {
        const records = await listMedicalRecords(patient.id);

        if (isActive) {
          setMedicalRecords(records);
        }
      } catch (error) {
        if (isActive) {
          setMedicalRecordsError(error.message || "Não foi possível carregar os prontuários.");
        }
      } finally {
        if (isActive) {
          setIsLoadingMedicalRecords(false);
        }
      }
    }

    loadMedicalRecords();

    return () => {
      isActive = false;
    };
  }, [patient?.id]);

  if (!patient) {
    return <LoadingState label="Carregando dados do paciente..." />;
  }

  return (
    <div className="space-y-6">
      <Panel
        title={patient.name}
        subtitle="Histórico clínico completo, prontuários, avaliações e gestão financeira do paciente."
        actions={
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-[color:var(--text-soft)] transition hover:bg-white/[0.08] hover:text-white"
          >
            <ArrowLeft size={16} />
            Voltar para pacientes
          </button>
        }
      >
        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Telefone</p>
              <p className="mt-3 text-base font-semibold text-white">{patient.phone || "-"}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Idade</p>
              <p className="mt-3 text-base font-semibold text-white">{calculateAge(patient.birthDate) || "-"}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">E-mail</p>
              <p className="mt-3 truncate text-base font-semibold text-white">{patient.email || "-"}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Cadastro</p>
              <p className="mt-3 text-base font-semibold text-white">{formatDate(patient.createdAt)}</p>
            </div>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(145deg,rgba(47,111,133,0.18),rgba(20,184,166,0.08))] p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-cyan-100">
                <UserRound size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Resumo rápido</p>
                <p className="mt-2 text-sm leading-7 text-cyan-50/85">
                  Use as abas abaixo para navegar entre prontuários e pagamentos. O fluxo agora concentra os tipos clínicos dentro de um único cadastro de prontuário.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <PatientTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "records" ? (
        <div className="space-y-6">
          {isLoadingMedicalRecords ? <LoadingState label="Carregando prontuários..." /> : null}
          {medicalRecordsError ? <ErrorState message={medicalRecordsError} /> : null}
          {!isLoadingMedicalRecords && !medicalRecordsError ? (
            <MedicalRecordsSection
              patientId={patient.id}
              patientName={patient.name}
              patient={patient}
              records={medicalRecords}
              onRecordsChange={setMedicalRecords}
            />
          ) : null}
        </div>
      ) : null}

      {activeTab === "payments" ? (
        <Panel
          title="Pagamentos do paciente"
          subtitle="Recebimentos vinculados aos atendimentos desse paciente, com estrutura pronta para filtros e lançamentos futuros."
        >
          <DataTable
            rows={payments}
            emptyState={
              <EmptyState
                title="Nenhum pagamento encontrado"
                description="Quando os atendimentos desse paciente tiverem registros financeiros, eles aparecerão aqui com status e contexto do serviço."
              />
            }
            columns={[
              {
                key: "serviceName",
                header: "Serviço",
                render: (row) => (
                  <div>
                    <p className="font-semibold text-white">{row.serviceName || "Serviço não informado"}</p>
                    <p className="mt-1 text-xs text-[color:var(--text-muted)]">{formatDate(row.appointmentDate)}</p>
                  </div>
                )
              },
              {
                key: "amount",
                header: "Valor",
                render: (row) => formatCurrency(row.amount)
              },
              {
                key: "method",
                header: "Método",
                render: (row) => row.method || "-"
              },
              {
                key: "status",
                header: "Status",
                render: (row) => <Badge value={row.status || "sem status"} />
              }
            ]}
          />
        </Panel>
      ) : null}
    </div>
  );
}
