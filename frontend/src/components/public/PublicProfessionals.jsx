import React from "react";
import { ArrowRight } from "lucide-react";

import fisio1 from "../../../images/fisio1.png";
import fisio2 from "../../../images/fisio2.png";
import fisio3 from "../../../images/fisio3.png";
import fisio4 from "../../../images/fisio4.png";

const professionals = [
  {
    id: "p1",
    image: fisio1,
    name: "Profissional 01",
    specialization: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  },
  {
    id: "p2",
    image: fisio2,
    name: "Profissional 02",
    specialization: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  },
  {
    id: "p3",
    image: fisio3,
    name: "Profissional 03",
    specialization: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  },
  {
    id: "p4",
    image: fisio4,
    name: "Profissional 04",
    specialization: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  }
];

function ProfessionalCard({ professional, index }) {
  const isReversed = index % 2 === 1;

  return (
    <article className="group rounded-[40px] border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[1fr_1.15fr]">
        {!isReversed ? (
          <div className="relative min-h-[320px]">
            <img
              src={professional.image}
              alt={professional.name}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/35 via-transparent to-transparent" />
          </div>
        ) : null}

        <div className={`p-8 md:p-10 ${isReversed ? "lg:order-2" : ""}`}>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            Profissionais especializados
          </div>

          <h3 className="mt-5 font-['Fraunces'] text-3xl font-semibold text-slate-900 md:text-4xl">
            {professional.name}
          </h3>

          <p className="mt-4 text-sm font-semibold text-sky-700">{professional.specialization}</p>

          <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">{professional.description}</p>

          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              onClick={() => { /* placeholder */ }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Agendar Horário
              <ArrowRight size={18} />
            </button>

            <span className="text-xs text-slate-500">
              Botão independente (placeholder para backend)
            </span>
          </div>
        </div>

        {isReversed ? (
          <div className="relative min-h-[320px] lg:order-1">
            <img
              src={professional.image}
              alt={professional.name}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/35 via-transparent to-transparent" />
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function PublicProfessionals() {
  return (
    <section id="professionals" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">Profissionais</p>
          <h2 className="mt-5 font-['Fraunces'] text-4xl font-semibold text-slate-900 md:text-5xl">
            Destaque para quem cuida
          </h2>
          <p className="mt-6 text-base leading-8 text-slate-600">
            Experiência premium em um layout alternado: foto grande, texto ao lado e botão de agendamento
            independente.
          </p>
        </div>

        <div className="mt-10 space-y-8">
          {professionals.map((p, idx) => (
            <ProfessionalCard key={p.id} professional={p} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

