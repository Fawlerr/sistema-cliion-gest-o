import React from "react";
import { HeartHandshake, MonitorCheck, ShieldCheck, Sparkles } from "lucide-react";

const benefits = [
  {
    title: "Atendimento Humanizado",
    desc: "Acolhimento, clareza e acompanhamento com empatia.",
    icon: HeartHandshake
  },
  {
    title: "Profissionais Especializados",
    desc: "Equipe preparada para conduzir seu processo com excelência.",
    icon: ShieldCheck
  },
  {
    title: "Equipamentos Modernos",
    desc: "Infraestrutura para cuidado contínuo e evoluções.",
    icon: MonitorCheck
  },
  {
    title: "Acompanhamento Individual",
    desc: "Organização e evolução para cada paciente.",
    icon: Sparkles
  }
];

export function PublicBenefits() {
  return (
    <section id="benefits" className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">Benefícios</p>
        <h2 className="mt-5 font-['Fraunces'] text-4xl font-semibold text-slate-900 md:text-5xl">
          Confiança que você sente na experiência
        </h2>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.title} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50">
                  <Icon size={20} className="text-sky-700" />
                </div>
                <p className="mt-5 text-lg font-semibold text-slate-900">{b.title}</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

