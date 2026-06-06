import React from "react";
import { HeartHandshake, MapPin, ShieldCheck, Sparkles } from "lucide-react";

export function PublicAbout() {
  return (
    <section id="about" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">Sobre a Cliion</p>
            <h2 className="mt-5 font-['Fraunces'] text-4xl font-semibold text-slate-900 md:text-5xl">
              Atendimento que une tecnologia e acolhimento
            </h2>
            <p className="mt-6 text-base leading-8 text-slate-600 md:text-lg">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { icon: HeartHandshake, title: "Humanização", desc: "Experiência acolhedora do início ao fim." },
                { icon: ShieldCheck, title: "Credibilidade", desc: "Procedimentos com organização e segurança." },
                { icon: Sparkles, title: "Tecnologia", desc: "Agendamento com disponibilidade validada." },
                { icon: MapPin, title: "Estrutura", desc: "Ambiente preparado para cuidado contínuo." }
              ].map((d) => (
                <div key={d.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50">
                      <d.icon size={18} className="text-sky-700" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{d.title}</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{d.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[36px] border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-teal-50 p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">Destaques</p>
            <h3 className="mt-4 font-['Fraunces'] text-3xl font-semibold text-slate-900">O que torna nossa experiência única</h3>

            <div className="mt-7 space-y-4">
              {[
                { title: "Equipe preparada", desc: "Profissionais com experiência e cuidado técnico." },
                { title: "Processo organizado", desc: "Fluxo claro com status e validações." },
                { title: "Acompanhamento", desc: "Continuidade no planejamento e evolução do cuidado." }
              ].map((x) => (
                <div key={x.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-sm font-semibold text-slate-900">{x.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{x.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

