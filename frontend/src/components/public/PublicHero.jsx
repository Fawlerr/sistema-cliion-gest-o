import React from "react";
import { ArrowRight, ShieldCheck, Stethoscope } from "lucide-react";

export function PublicHero({ onPrimaryCta, onSecondaryCta, heroImageUrl }) {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-white"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(2,132,199,0.12) 0%, rgba(20,184,166,0.08) 45%, rgba(59,130,246,0.06) 100%)`
      }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute right-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full bg-teal-200/25 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:px-6 md:py-20 lg:grid-cols-[1fr_1fr] lg:px-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm text-slate-700 shadow-sm">
            <ShieldCheck size={16} className="text-sky-600" />
            Experiência premium • agendamento organizado
          </div>

          <h1 className="mt-6 font-['Fraunces'] text-4xl font-semibold leading-[1.06] text-slate-900 md:text-6xl">
            Cuidando da sua recuperação com excelência
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
            Plataforma moderna para clínicas e profissionais da saúde: transparência, segurança e um fluxo
            de agendamento pensado para transformar interesse em cuidado real.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onPrimaryCta}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(2,8,23,0.18)] transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Agendar Consulta
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              onClick={onSecondaryCta}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              <Stethoscope size={18} />
              Conheça Nossa Equipe
            </button>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { title: "Disponibilidade validada", desc: "Sem tentativa e erro." },
              { title: "Fluxo claro", desc: "Do clique ao horário." },
              { title: "Cuidado humanizado", desc: "Experiência acolhedora." }
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm"
              >
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-[40px] bg-gradient-to-br from-sky-500/10 via-teal-400/10 to-indigo-500/10 blur-xl" />
          <div className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-slate-50 shadow-sm">
            <img
              src={heroImageUrl}
              alt="Profissionais de saúde"
              loading="eager"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <div className="rounded-2xl bg-white/85 backdrop-blur-xl p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Atendimento</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">Agende com confiança</p>
                <p className="mt-2 text-sm text-slate-600">Horários controlados e acompanhamento organizado.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

