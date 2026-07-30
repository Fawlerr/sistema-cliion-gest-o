import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarClock, CheckCircle2, Link2, ShieldAlert } from "lucide-react";
import logo from "../../images/logo.png";
import { ErrorState } from "../components/ErrorState";
import { FormField } from "../components/FormField";
import { LoadingState } from "../components/LoadingState";
import { useApi } from "../hooks/useApi";
import { apiRequest, getCollection, getResource } from "../lib/api";
import { formatCurrency } from "../lib/formatters";
import { navigateTo } from "../lib/navigation";

function buildInitialForm(patient = null) {
  return {
    patientName: patient?.name || "",
    email: patient?.email || "",
    phone: patient?.phone || "",
    appointmentDate: "",
    appointmentTime: ""
  };
}

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isPastSlot(date, time) {
  if (!date || !time) {
    return false;
  }

  return new Date(`${date}T${time}`).getTime() < Date.now();
}

export function PublicAppointmentLinkPage({ token }) {
  const link = useApi((signal) => getResource(`/appointment-links/public/appointment-links/${token}`, { signal }), [token]);
  const services = useApi((signal) => getCollection("/services", { signal }), []);
  const patients = useApi((signal) => getCollection("/patients", { signal }), []);

  const linkedPatient = useMemo(() => {
    const patientId = link.data?.patientId;
    return (patients.data?.data || []).find((patient) => String(patient.id) === String(patientId)) || null;
  }, [link.data, patients.data]);

  const linkedService = useMemo(() => {
    const serviceId = link.data?.serviceId;
    return (services.data?.data || []).find((service) => String(service.id) === String(serviceId)) || null;
  }, [link.data, services.data]);

  const [form, setForm] = useState(buildInitialForm());
  const [availability, setAvailability] = useState({ date: "", availableSlots: [] });
  const [availabilityError, setAvailabilityError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  useEffect(() => {
    setForm(buildInitialForm(linkedPatient));
  }, [linkedPatient]);

  useEffect(() => {
    if (!form.appointmentDate) {
      setAvailability({ date: "", availableSlots: [] });
      setAvailabilityError("");
      return;
    }

    let isActive = true;
    const abortController = new AbortController();

    async function loadAvailability() {
      setIsCheckingAvailability(true);
      setAvailabilityError("");

      try {
        const response = await apiRequest(`/appointment-links/public/appointment-links/${token}/availability`, {
          query: { date: form.appointmentDate },
          signal: abortController.signal
        });

        if (!isActive) {
          return;
        }

        setAvailability(response.data || { date: form.appointmentDate, availableSlots: [] });
      } catch (error) {
        if (!isActive || error.name === "AbortError") {
          return;
        }

        setAvailability({ date: form.appointmentDate, availableSlots: [] });
        setAvailabilityError(error.message || "Não foi possível verificar a disponibilidade.");
      } finally {
        if (isActive) {
          setIsCheckingAvailability(false);
        }
      }
    }

    loadAvailability();

    return () => {
      isActive = false;
      abortController.abort();
    };
  }, [form.appointmentDate, token]);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "appointmentDate" ? { appointmentTime: "" } : {})
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");
    setIsSaving(true);

    try {
      await apiRequest(`/appointment-links/public/appointment-links/${token}/book`, {
        method: "POST",
        body: {
          name: form.patientName,
          email: form.email || null,
          phone: form.phone || null,
          date: form.appointmentDate,
          time: form.appointmentTime,
          serviceId: linkedService?.id || null
        }
      });

      setSubmitSuccess("Agendamento confirmado com sucesso.");
      setForm(buildInitialForm(linkedPatient));
      setAvailability({ date: "", availableSlots: [] });
    } catch (error) {
      setSubmitError(error.message || "Não foi possível concluir seu agendamento.");
    } finally {
      setIsSaving(false);
    }
  }

  const slotStates = (availability.availableSlots || []).map((time) => ({
    time,
    past: isPastSlot(form.appointmentDate, time),
    disabled: !form.appointmentDate || isPastSlot(form.appointmentDate, time)
  }));

  if (link.isLoading || services.isLoading || patients.isLoading) {
    return (
      <div className="min-h-screen px-4 py-6 md:px-6">
        <LoadingState label="Validando link e carregando configurações..." />
      </div>
    );
  }

  if (link.error || services.error || patients.error) {
    return (
      <div className="min-h-screen px-4 py-6 md:px-6">
        <ErrorState message={link.error || services.error || patients.error} />
      </div>
    );
  }

  return (
    <div className="page-fade min-h-screen bg-[linear-gradient(180deg,#f3ecdf_0%,#f7fafc_46%,#fffcf7_100%)] text-slate-900">
      <header className="border-b border-slate-900/5 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6 lg:px-8">
          <button type="button" onClick={() => navigateTo("/")} className="flex items-center gap-3">
            <img src={logo} alt="Cliion" className="h-11 w-auto object-contain" />
            <div className="text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">Cliion</p>
              <p className="text-sm text-slate-600">Link exclusivo de agendamento</p>
            </div>
          </button>

          <a href="/" className="rounded-full border border-slate-900/10 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white">
            Site principal
          </a>
        </div>
      </header>

      <main className="px-4 py-8 md:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[36px] bg-[linear-gradient(155deg,#081420_0%,#143550_48%,#0b2236_100%)] p-8 text-white shadow-[0_34px_100px_rgba(15,23,42,0.25)]">
            <button
              type="button"
              onClick={() => navigateTo("/")}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 transition hover:bg-white/10"
            >
              <ArrowLeft size={14} />
              Voltar ao site
            </button>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.28em] text-teal-300">Convite seguro</p>
            <h1 className="mt-4 font-['Fraunces'] text-4xl font-semibold leading-tight">
              {linkedService?.name || "Agendamento personalizado"}
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Este link foi criado para oferecer uma reserva direta, com janela de horários controlada e validade limitada.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Serviço</p>
                <p className="mt-3 text-2xl font-semibold">{linkedService?.name || "A definir"}</p>
                <p className="mt-2 text-sm text-slate-300">
                  {linkedService ? formatCurrency(linkedService.price) : "Valor informado pela equipe"}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Validade</p>
                <p className="mt-3 text-2xl font-semibold">
                  {link.data?.expiresAt ? new Date(link.data.expiresAt).toLocaleDateString("pt-BR") : "Sem data"}
                </p>
                <p className="mt-2 text-sm text-slate-300">Link monitorado e invalidado automaticamente quando expira.</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <CalendarClock size={18} className="text-teal-300" />
                  <div>
                    <p className="font-semibold">Disponibilidade real</p>
                    <p className="text-sm text-slate-300">Os horários livres são carregados em tempo real para a data escolhida.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <ShieldAlert size={18} className="text-amber-300" />
                  <div>
                    <p className="font-semibold">Link autenticado</p>
                    <p className="text-sm text-slate-300">A reserva ocorre por token único, com expiração e uso controlados.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-300" />
                  <div>
                    <p className="font-semibold">Confirmação imediata</p>
                    <p className="text-sm text-slate-300">Ao concluir, o agendamento entra direto no painel administrativo.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[36px] border border-slate-900/8 bg-white/92 p-6 shadow-[0_28px_70px_rgba(148,101,63,0.12)] md:p-8">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-teal-700">Escolha seu horário</p>
              <h2 className="mt-3 font-['Fraunces'] text-4xl font-semibold text-slate-950">Finalize os dados para reservar pelo link seguro.</h2>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 md:grid-cols-2">
                <FormField label="Nome">
                  <input
                    type="text"
                    value={form.patientName}
                    onChange={(event) => updateField("patientName", event.target.value)}
                    className="w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white"
                    placeholder="Seu nome completo"
                    required
                  />
                </FormField>
                <FormField label="E-mail">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    className="w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white"
                    placeholder="seu.email@dominio.com"
                  />
                </FormField>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <FormField label="Telefone">
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    className="w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white"
                    placeholder="(11) 99999-9999"
                  />
                </FormField>
                <FormField label="Data">
                  <input
                    type="date"
                    min={getTodayDateString()}
                    value={form.appointmentDate}
                    onChange={(event) => updateField("appointmentDate", event.target.value)}
                    className="w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white"
                    required
                  />
                </FormField>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Horários disponíveis</p>
                    <p className="text-sm text-slate-500">A janela abaixo respeita a configuração e os horários já ocupados.</p>
                  </div>
                  {isCheckingAvailability ? <p className="text-sm text-teal-700">Atualizando disponibilidade...</p> : null}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {slotStates.map((slot) => {
                    const isSelected = form.appointmentTime === slot.time;

                    return (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => updateField("appointmentTime", slot.time)}
                        disabled={slot.disabled}
                        className={`rounded-[20px] border px-4 py-3 text-left transition ${
                          isSelected
                            ? "border-teal-600 bg-teal-600 text-white shadow-[0_16px_34px_rgba(13,148,136,0.24)]"
                            : slot.disabled
                              ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                              : "border-slate-200 bg-white text-slate-900 hover:border-teal-400 hover:bg-teal-50"
                        }`}
                      >
                        <p className="text-base font-semibold">{slot.time}</p>
                        <p className={`mt-1 text-xs ${isSelected ? "text-teal-50" : slot.disabled ? "text-slate-400" : "text-slate-500"}`}>
                          {slot.past ? "Encerrado" : "Disponível"}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {!slotStates.length && !isCheckingAvailability ? (
                  <div className="mt-4 rounded-[20px] border border-dashed border-slate-300 bg-white px-4 py-4 text-sm text-slate-500">
                    Selecione uma data para visualizar os horários liberados neste link.
                  </div>
                ) : null}

                {availabilityError ? <p className="mt-4 text-sm text-rose-600">{availabilityError}</p> : null}
              </div>

              {submitSuccess ? (
                <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  {submitSuccess}
                </div>
              ) : null}

              {submitError ? (
                <div className="rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  {submitError}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Link2 size={16} />
                  <span>Link válido enquanto houver disponibilidade e dentro do prazo informado.</span>
                </div>
                <button
                  type="submit"
                  disabled={isSaving || !form.appointmentTime}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Confirmando..." : "Confirmar agendamento"}
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
