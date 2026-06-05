import { CalendarClock, FileText } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { Panel } from "./Panel";
import { formatDateTime } from "../lib/formatters";

export function EvolutionTimeline({ entries }) {
  return (
    <Panel
      title="Evolução de atendimento"
      subtitle="Linha do tempo clínica com foco em sessões, observações e contexto de atendimento."
    >
      {entries.length ? (
        <div className="space-y-4">
          {entries.map((entry) => (
            <article
              key={entry.id}
              className="relative rounded-[24px] border border-white/10 bg-white/[0.04] p-5 pl-8"
            >
              <span className="absolute left-4 top-6 h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.45)]" />
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">{entry.title}</p>
                  <p className="mt-2 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                    <CalendarClock size={13} />
                    {formatDateTime(entry.date, entry.time)}
                  </p>
                </div>
                <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                  {entry.status}
                </span>
              </div>

              <p className="mt-4 text-sm leading-7 text-[color:var(--text-soft)]">
                {entry.description}
              </p>

              {entry.observations ? (
                <div className="mt-4 rounded-[18px] border border-white/8 bg-slate-950/22 px-4 py-3">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                    <FileText size={12} />
                    Observações
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-200/90">{entry.observations}</p>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhuma evolução registrada"
          description="Quando os atendimentos e observações forem centralizados aqui, a linha do tempo exibirá o histórico cronológico do paciente."
        />
      )}
    </Panel>
  );
}
