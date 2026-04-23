import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { getCollection } from "../lib/api";
import { formatDate } from "../lib/formatters";
import { Badge } from "../components/Badge";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { SectionToolbar } from "../components/SectionToolbar";

const dayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];
const defaultStartHour = 8;
const defaultEndHour = 18;

function startOfWeek(date) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(date, amount) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function toIsoDate(value) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatWeekdayLabel(date, index) {
  return `${dayLabels[index]} ${String(date.getDate()).padStart(2, "0")}`;
}

function formatWeekRange(weekStart) {
  const weekEnd = addDays(weekStart, 6);
  return `${formatDate(weekStart)} a ${formatDate(weekEnd)}`;
}

function getHourValue(appointmentTime) {
  return Number.parseInt(String(appointmentTime || "").slice(0, 2), 10);
}

function getTimeLabel(hour) {
  return `${String(hour).padStart(2, "0")}:00`;
}

function compareAppointments(left, right) {
  return String(left.appointmentTime).localeCompare(String(right.appointmentTime)) || left.id - right.id;
}

export function AgendaPage() {
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(() => {
    const baseWeek = startOfWeek(new Date());
    return addDays(baseWeek, weekOffset * 7);
  }, [weekOffset]);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart]
  );
  const weekStartParam = toIsoDate(weekStart);
  const weekEndParam = toIsoDate(weekDays[6]);

  const { data, isLoading, error } = useApi(
    (signal) => getCollection("/appointments", {
      query: { from: weekStartParam, to: weekEndParam, limit: 500 },
      signal
    }),
    [weekStartParam, weekEndParam]
  );

  const appointments = data?.data || [];

  const calendarData = useMemo(() => {
    const appointmentHours = appointments
      .map((appointment) => getHourValue(appointment.appointmentTime))
      .filter((hour) => Number.isInteger(hour));
    const firstHour = appointmentHours.length
      ? Math.min(defaultStartHour, ...appointmentHours)
      : defaultStartHour;
    const lastHour = appointmentHours.length
      ? Math.max(defaultEndHour, ...appointmentHours)
      : defaultEndHour;
    const hours = Array.from({ length: lastHour - firstHour + 1 }, (_, index) => firstHour + index);

    const slots = new Map();

    appointments.forEach((appointment) => {
      const dayKey = String(appointment.appointmentDate).slice(0, 10);
      const hourKey = getHourValue(appointment.appointmentTime);

      if (!Number.isInteger(hourKey)) {
        return;
      }

      const slotKey = `${dayKey}-${hourKey}`;
      const current = slots.get(slotKey) || [];
      current.push(appointment);
      current.sort(compareAppointments);
      slots.set(slotKey, current);
    });

    return { hours, slots };
  }, [appointments]);

  if (isLoading) {
    return <LoadingState label="Carregando agenda semanal..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-6">
      <SectionToolbar
        title="Agenda"
        subtitle={`Semana de ${formatWeekRange(weekStart)} com ${appointments.length} agendamentos posicionados por dia e horario.`}
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
              Proxima semana
              <ChevronRight size={16} />
            </button>
          </div>
        }
      />

      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] shadow-[0_24px_80px_rgba(5,8,22,0.35)]">
        <div className="overflow-x-auto">
          <div
            className="grid min-w-[960px]"
            style={{ gridTemplateColumns: "92px repeat(7, minmax(0, 1fr))" }}
          >
            <div className="border-b border-r border-white/10 bg-white/[0.04] px-4 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
              Hora
            </div>
            {weekDays.map((day, index) => (
              <div
                key={toIsoDate(day)}
                className="border-b border-white/10 bg-white/[0.04] px-4 py-4 text-sm"
              >
                <p className="font-semibold text-white">{formatWeekdayLabel(day, index)}</p>
                <p className="mt-1 text-xs text-[color:var(--text-muted)]">{formatDate(day)}</p>
              </div>
            ))}

            {calendarData.hours.map((hour) => (
              <div key={hour} className="contents">
                <div className="border-r border-t border-white/10 bg-white/[0.02] px-4 py-4 text-sm font-medium text-[color:var(--text-soft)]">
                  {getTimeLabel(hour)}
                </div>
                {weekDays.map((day) => {
                  const slotKey = `${toIsoDate(day)}-${hour}`;
                  const slotAppointments = calendarData.slots.get(slotKey) || [];

                  return (
                    <div
                      key={slotKey}
                      className="min-h-[116px] border-t border-white/10 px-3 py-3"
                    >
                      {slotAppointments.length ? (
                        <div className="space-y-2">
                          {slotAppointments.map((appointment) => (
                            <article
                              key={appointment.id}
                              className="rounded-2xl border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(49,92,255,0.18),rgba(25,37,92,0.38))] px-3 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.22)]"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-white">{appointment.patientName}</p>
                                  <p className="mt-1 truncate text-xs text-cyan-100/80">{appointment.serviceName}</p>
                                </div>
                                <Badge value={appointment.status || "sem status"} />
                              </div>
                              <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                                {String(appointment.appointmentTime).slice(0, 5)}
                              </p>
                              <p className="mt-2 text-xs text-[color:var(--text-soft)]">{appointment.userName}</p>
                              {appointment.notes ? (
                                <p className="mt-2 line-clamp-2 text-xs text-[color:var(--text-soft)]">{appointment.notes}</p>
                              ) : null}
                            </article>
                          ))}
                        </div>
                      ) : (
                        <div className="flex h-full min-h-[92px] items-center justify-center rounded-2xl border border-dashed border-white/8 bg-white/[0.015] text-xs text-[color:var(--text-muted)]">
                          Livre
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
