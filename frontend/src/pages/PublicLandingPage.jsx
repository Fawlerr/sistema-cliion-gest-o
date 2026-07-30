import { useMemo } from "react";
import { ArrowRight } from "lucide-react";

import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { useApi } from "../hooks/useApi";
import { getCollection } from "../lib/api";
import { formatCurrency } from "../lib/formatters";
import { navigateTo } from "../lib/navigation";

import { PublicAbout } from "../components/public/PublicAbout";
import { PublicBenefits } from "../components/public/PublicBenefits";
import { PublicFinalCTA } from "../components/public/PublicFinalCTA";
import { PublicHero } from "../components/public/PublicHero";
import { PublicProfessionals } from "../components/public/PublicProfessionals";
import { PublicFooter, PublicHeader } from "../components/public/PublicLayout";
import { PublicTestimonials } from "../components/public/PublicTestimonials";

const heroImageUrl = "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1600&q=80";

export function PublicLandingPage() {
  const services = useApi((signal) => getCollection("/services", { signal }), []);
  const serviceCards = useMemo(() => services.data?.data || [], [services.data]);

  function scrollToId(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (services.isLoading) {
    return (
      <div className="min-h-screen px-4 py-6 md:px-6">
        <LoadingState label="Carregando serviços da clínica..." />
      </div>
    );
  }

  if (services.error) {
    return (
      <div className="min-h-screen px-4 py-6 md:px-6">
        <ErrorState message={services.error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicHeader
        onNavToAdmin={() => navigateTo("/admin")}
        brandSubtitle="Plataforma moderna de saúde e agenda inteligente"
      />

      <main>
        <PublicHero
          heroImageUrl={heroImageUrl}
          onPrimaryCta={() => scrollToId("services")}
          onSecondaryCta={() => scrollToId("professionals")}
        />

        <PublicAbout />

        <section id="services" className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">Serviços</p>
              <h2 className="mt-5 font-['Fraunces'] text-4xl font-semibold text-slate-900 md:text-5xl">
                Escolha o atendimento ideal e siga para o agendamento
              </h2>
              <p className="mt-6 text-base leading-8 text-slate-600">
                Cada card leva para uma página de reserva específica do serviço, com horários controlados.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {serviceCards.length ? (
                serviceCards.map((service) => (
                  <article
                    key={service.id}
                    className="group rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                        Atendimento
                      </span>
                      <span className="text-lg font-semibold text-slate-900">{formatCurrency(service.price)}</span>
                    </div>

                    <h3 className="mt-5 text-2xl font-semibold text-slate-900">{service.name}</h3>
                    <p className="mt-3 min-h-[96px] text-sm leading-7 text-slate-600">
                      {service.description ||
                        "Descrição em atualização. A página de reserva apresenta esse serviço em um fluxo claro."}
                    </p>

                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-slate-500">
                        {service.durationMinutes ? `${service.durationMinutes} min` : "Duração ajustada"}
                      </div>
                      <button
                        type="button"
                        onClick={() => navigateTo(`/booking/${service.id}`)}
                        className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        Reservar
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState
                  title="Nenhum serviço disponível"
                  description="A clínica ainda não publicou serviços para agendamento online."
                />
              )}
            </div>

            <div className="mt-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div className="text-sm text-slate-600">Agendamento premium e organizado para oferecer segurança e confiança.</div>
              <button
                type="button"
                disabled={!serviceCards[0]}
                onClick={() => {
                  if (serviceCards[0]) navigateTo(`/booking/${serviceCards[0].id}`);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Explorar agendamento
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>

        <PublicProfessionals />
        <PublicBenefits />
        <PublicTestimonials />

        <PublicFinalCTA onCta={() => scrollToId("services")} />
      </main>

      <PublicFooter />
    </div>
  );
}

