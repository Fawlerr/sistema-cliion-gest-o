import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Agenda } from "../components/Agenda";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { SectionToolbar } from "../components/SectionToolbar";
import { useApi } from "../hooks/useApi";
import { getCollection } from "../lib/api";
import { formatDate } from "../lib/formatters";

function addDays(date, amount) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function startOfWeek(date) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function toIsoDate(value) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatWeekRange(weekStart) {
  const weekEnd = addDays(weekStart, 6);
  return `${formatDate(weekStart)} a ${formatDate(weekEnd)}`;
}

export function AgendaPage() {
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(() => {
    const today = new Date();
    return addDays(startOfWeek(today), weekOffset * 7);
  }, [weekOffset]);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart]
  );
  const weekStartParam = toIsoDate(weekStart);
  const weekEndParam = toIsoDate(weekDays[6]);

  const appointments = useApi(
    (signal) => getCollection("/appointments", {
      query: { from: weekStartParam, to: weekEndParam, limit: 500 },
      signal
    }),
    [weekStartParam, weekEndParam]
  );
  const services = useApi((signal) => getCollection("/services", { signal }), []);
  const patients = useApi((signal) => getCollection("/patients", { signal }), []);

  const servicesById = useMemo(
    () => Object.fromEntries((services.data?.data || []).map((service) => [service.id, service])),
    [services.data]
  );

  const patientsById = useMemo(
    () => Object.fromEntries((patients.data?.data || []).map((patient) => [patient.id, patient])),
    [patients.data]
  );

  const enrichedAppointments = useMemo(
    () =>
      (appointments.data?.data || []).map((appointment) => ({
        ...appointment,
        phone: patientsById[appointment.patientId]?.phone || ""
      })),
    [appointments.data, patientsById]
  );

  if (appointments.isLoading || services.isLoading || patients.isLoading) {
    return <LoadingState label="Carregando agenda semanal..." />;
  }

  if (appointments.error || services.error || patients.error) {
    return <ErrorState message={appointments.error || services.error || patients.error} />;
  }

  return (
    <div className="flex h-[calc(100vh-210px)] min-h-[720px] flex-col gap-6">
      <SectionToolbar
        title="Agenda"
        subtitle={`Semana de ${formatWeekRange(weekStart)} com ${enrichedAppointments.length} agendamentos distribuídos por dia e horário.`}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setWeekOffset((current) => current - 1)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              <ChevronLeft size={16} />
              Semana anterior
            </button>
            <button
              type="button"
              onClick={() => setWeekOffset(0)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              <CalendarDays size={16} />
              Semana atual
            </button>
            <button
              type="button"
              onClick={() => setWeekOffset((current) => current + 1)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Próxima semana
              <ChevronRight size={16} />
            </button>
          </div>
        }
      />

      <div className="min-h-0 flex-1">
        <Agenda appointments={enrichedAppointments} weekDays={weekDays} servicesById={servicesById} />
      </div>
    </div>
  );
}
