import React from "react";
import { ArrowRight } from "lucide-react";

export function PublicFinalCTA({ onCta }) {
  return (
    <section className="bg-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20 lg:px-8">
        <div className="rounded-[40px] border border-white/10 bg-[linear-gradient(135deg,rgba(14,165,233,0.25)_0%,rgba(20,184,166,0.22)_50%,rgba(99,102,241,0.15)_100%)] p-8 md:p-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-200">Pronto para iniciar</p>
              <h2 className="mt-4 font-['Fraunces'] text-4xl font-semibold md:text-5xl">
                Pronto para iniciar sua recuperação?
              </h2>
              <p className="mt-4 max-w-2xl text-slate-200/90">
                Agende sua consulta com confiança e organize seu cuidado em poucos passos.
              </p>
            </div>

            <button
              type="button"
              onClick={onCta}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-slate-900 shadow-[0_24px_70px_rgba(2,8,23,0.35)] transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              Agendar Consulta
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

