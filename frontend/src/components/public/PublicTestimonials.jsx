import React from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Mariana S.",
    role: "Paciente • Reabilitação Pós-Operatória",
    quote:
      "O atendimento na Cliion superou todas as minhas expectativas. O acompanhamento do fisioterapeuta durante o pós-operatório foi fundamental para o meu retorno seguro às rotinas diárias."
  },
  {
    name: "Ricardo P.",
    role: "Paciente • Osteopatia & Dor Lumbar",
    quote:
      "Cheguei à clínica com fortes dores nas costas e dificuldades para trabalhar. Após poucas sessões de osteopatia e orientações precisas, já sinto um alívio enorme."
  },
  {
    name: "Fernanda L.",
    role: "Paciente • Fisioterapia Esportiva",
    quote:
      "Plataforma de agendamento prática e pontualidade impecável no atendimento. Os profissionais demonstram um cuidado técnico incrível em cada etapa do tratamento."
  }
];

export function PublicTestimonials() {
  return (
    <section id="testimonials" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">Depoimentos</p>
        <h2 className="mt-5 font-['Fraunces'] text-4xl font-semibold text-slate-900 md:text-5xl">
          O que nossos pacientes dizem
        </h2>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="flex items-center gap-1 text-sky-600">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" className="opacity-90" />
                ))}
              </div>
              <p className="mt-5 text-sm leading-7 text-slate-700">“{t.quote}”</p>
              <div className="mt-6">
                <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                <p className="text-xs text-slate-600">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

