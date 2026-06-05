import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Sparkles, Stethoscope } from "lucide-react";
import logo from "../../images/logo.png";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { useApi } from "../hooks/useApi";
import { getCollection } from "../lib/api";
import { formatCurrency } from "../lib/formatters";
import { navigateTo } from "../lib/navigation";

const heroImageUrl = "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1600&q=80";

const highlights = [
  {
    title: "Agendamento sem fricção",
    description: "Selecione o serviço e veja os horários realmente disponíveis antes de confirmar.",
    icon: CalendarDays
  },
  {
    title: "Fluxo integrado",
    description: "Cada reserva vai direto para a agenda administrativa da clínica.",
    icon: Sparkles
  },
  {
    title: "Cuidado profissional",
    description: "Uma experiência digital pensada para transmitir segurança e acolhimento.",
    icon: CheckCircle2
  }
];

function PublicParallaxThread() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    function handleScroll() {
      setOffset(window.scrollY * 0.12);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block" aria-hidden="true">
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 opacity-60 transition-transform duration-150"
        style={{ transform: `translateX(-50%) translateY(${offset}px)` }}
      >
        <svg width="420" height="1900" viewBox="0 0 420 1900" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M238 0C178 96 192 178 238 256C284 334 284 392 228 476C172 560 160 650 210 742C260 834 272 930 224 1012C176 1094 178 1188 234 1276C290 1364 304 1444 250 1538C196 1632 198 1726 242 1900"
            stroke="url(#thread-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="8 18"
          />
          <circle cx="238" cy="256" r="7" fill="#14B8A6" />
          <circle cx="228" cy="476" r="8" fill="#F97316" />
          <circle cx="210" cy="742" r="7" fill="#0F172A" />
          <circle cx="224" cy="1012" r="8" fill="#14B8A6" />
          <circle cx="234" cy="1276" r="7" fill="#F97316" />
          <defs>
            <linearGradient id="thread-gradient" x1="210" y1="0" x2="210" y2="1900" gradientUnits="userSpaceOnUse">
              <stop stopColor="#14B8A6" />
              <stop offset="0.5" stopColor="#FB923C" />
              <stop offset="1" stopColor="#0F172A" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function PublicSection({ id, eyebrow, title, description, children }) {
  return (
    <section id={id} className="relative px-4 py-14 md:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-700">{eyebrow}</p> : null}
          <h2 className="mt-4 font-['Fraunces'] text-4xl font-semibold text-slate-950 md:text-5xl">{title}</h2>
          {description ? <p className="mt-4 text-base leading-7 text-slate-600">{description}</p> : null}
        </div>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

export function PublicLandingPage() {
  const services = useApi((signal) => getCollection("/services", { signal }), []);
  const serviceCards = useMemo(() => services.data?.data || [], [services.data]);

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
    <div className="page-fade relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f4ede2_0%,#f8fbfd_38%,#fffdf7_100%)] text-slate-900">
      <PublicParallaxThread />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6 lg:px-8">
          <a href="#hero" className="flex items-center gap-3">
            <img src={logo} alt="Clinic Dashboard Demo" className="h-12 w-auto object-contain" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-300">Clinic Dashboard Demo</p>
              <p className="text-sm text-slate-300">Clínica moderna com experiência digital</p>
            </div>
          </a>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-200 md:flex">
            <a href="#services" className="transition hover:text-white">Serviços</a>
            <a href="#experience" className="transition hover:text-white">Experiência</a>
            <a href="/admin" className="rounded-full border border-white/10 px-4 py-2 transition hover:bg-white/10">
              Área administrativa
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section
          id="hero"
          className="relative min-h-[92vh] overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(115deg, rgba(6, 19, 31, 0.8), rgba(6, 19, 31, 0.42)), url("${heroImageUrl}")`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.18),transparent_30%)]" />
          <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-4 py-24 md:px-6 lg:px-8">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.34em] text-teal-300">Saúde, acolhimento e agenda inteligente</p>
              <h1 className="mt-6 text-center font-['Fraunces'] text-5xl font-semibold leading-[1.02] text-white md:text-left md:text-7xl">
                Cuidado clínico com uma jornada digital fluida do primeiro clique ao horário confirmado.
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-center text-lg leading-8 text-slate-200 md:mx-0 md:text-left">
                Um site pensado para transmitir confiança, apresentar seus serviços e transformar interesse em agendamentos reais com disponibilidade validada em tempo real.
              </p>

              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row md:items-start">
                <a
                  href="#services"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_22px_44px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover:bg-slate-100"
                >
                  Agendar Agora
                  <ArrowRight size={18} />
                </a>
                <a
                  href="#experience"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Conhecer a experiência
                </a>
              </div>
            </div>
          </div>
        </section>

        <PublicSection
          id="services"
          eyebrow="Serviços"
          title="Escolha o atendimento ideal e siga para um agendamento dedicado."
          description="Cada card leva para uma página de reserva específica do serviço, com detalhes claros e slots disponíveis em vez de digitação manual de horário."
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {serviceCards.length ? (
              serviceCards.map((service) => (
                <article
                  key={service.id}
                  className="group rounded-[32px] border border-slate-900/8 bg-white/85 p-6 shadow-[0_20px_50px_rgba(148,101,63,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_32px_72px_rgba(148,101,63,0.16)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
                      Atendimento
                    </span>
                    <span className="text-lg font-semibold text-slate-950">{formatCurrency(service.price)}</span>
                  </div>

                  <h3 className="mt-5 text-2xl font-semibold text-slate-950">{service.name}</h3>
                  <p className="mt-3 min-h-[96px] text-sm leading-7 text-slate-600">
                    {service.description || "Descrição em atualização. A página de reserva apresenta esse serviço em um fluxo claro, rápido e responsivo."}
                  </p>

                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock3 size={16} />
                      <span>{service.durationMinutes ? `${service.durationMinutes} min` : "Duração ajustada pela equipe"}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigateTo(`/booking/${service.id}`)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Reservar
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState title="Nenhum serviço disponível" description="A clínica ainda não publicou serviços para agendamento online." />
            )}
          </div>
        </PublicSection>

        <PublicSection
          id="experience"
          eyebrow="Experiência"
          title="Uma home que conduz a decisão com clareza, ritmo e confiança."
          description="O parallax conecta as seções visualmente, enquanto o fluxo de reserva reduz atrito com disponibilidade verificável e estados de interface objetivos."
        >
          <div className="grid gap-5 md:grid-cols-3">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-[30px] border border-slate-900/8 bg-white/80 p-6 shadow-[0_18px_44px_rgba(148,101,63,0.07)]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-800">
                    <Icon size={20} />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-8 rounded-[34px] bg-[linear-gradient(145deg,#0f172a_0%,#17324a_48%,#0f2436_100%)] p-8 text-white shadow-[0_28px_80px_rgba(15,23,42,0.24)]">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-300">Fluxo de reserva</p>
                <h3 className="mt-4 font-['Fraunces'] text-4xl font-semibold">Escolha o serviço, visualize os slots livres e confirme com segurança.</h3>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  O sistema consulta a agenda do dia, bloqueia horários ocupados, restringe o expediente entre 08:00 e 17:00 e impede reservas no passado antes mesmo do envio ao backend.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (serviceCards[0]) {
                    navigateTo(`/booking/${serviceCards[0].id}`);
                  }
                }}
                disabled={!serviceCards[0]}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Explorar agendamento
                <Stethoscope size={18} />
              </button>
            </div>
          </div>
        </PublicSection>
      </main>
    </div>
  );
}
