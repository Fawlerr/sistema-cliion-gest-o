import { useEffect, useMemo, useRef } from "react";
import { AppointmentCard } from "./AppointmentCard";
import { TimeSlot } from "./TimeSlot";

const rowHeight = 84;
const columnWidth = 184;
const defaultStartHour = 8;
const defaultEndHour = 18;
const defaultDurationMinutes = 60;
const dayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];

function getMinutesFromTime(value) {
  const [hours, minutes] = String(value || "00:00").slice(0, 5).split(":").map((part) => Number.parseInt(part, 10));
  return (Number.isInteger(hours) ? hours : 0) * 60 + (Number.isInteger(minutes) ? minutes : 0);
}

function formatHourLabel(hour) {
  return `${String(hour).padStart(2, "0")}h`;
}

function toIsoDate(value) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDayHeader(date, index) {
  return {
    label: dayLabels[index],
    day: String(date.getDate()).padStart(2, "0"),
    key: toIsoDate(date)
  };
}

function getCurrentDayAndHour(weekDays) {
  const now = new Date();
  const dayKey = toIsoDate(now);
  const dayIndex = weekDays.findIndex((day) => toIsoDate(day) === dayKey);

  if (dayIndex === -1) {
    return { dayIndex: -1, hour: -1, minuteOffset: 0 };
  }

  return {
    dayIndex,
    hour: now.getHours(),
    minuteOffset: now.getMinutes()
  };
}

export function Agenda({ appointments = [], weekDays = [], servicesById = {} }) {
  const scrollContainerRef = useRef(null);
  const hours = useMemo(
    () => Array.from({ length: defaultEndHour - defaultStartHour + 1 }, (_, index) => defaultStartHour + index),
    []
  );
  const dayHeaders = useMemo(() => weekDays.map((day, index) => formatDayHeader(day, index)), [weekDays]);
  const totalHeight = hours.length * rowHeight;
  const currentMarker = useMemo(() => getCurrentDayAndHour(weekDays), [weekDays]);

  const positionedAppointments = useMemo(
    () =>
      appointments
        .map((appointment) => {
          const appointmentDateKey = String(appointment.appointmentDate).slice(0, 10);
          const dayIndex = dayHeaders.findIndex((day) => day.key === appointmentDateKey);

          if (dayIndex === -1) {
            return null;
          }

          const startMinutes = getMinutesFromTime(appointment.appointmentTime);
          const startHour = Math.floor(startMinutes / 60);
          const startMinute = startMinutes % 60;

          if (startHour < defaultStartHour || startHour > defaultEndHour) {
            return null;
          }

          const durationMinutes = Number(servicesById[appointment.serviceId]?.durationMinutes) || defaultDurationMinutes;
          const top = (startHour - defaultStartHour) * rowHeight + (startMinute / 60) * rowHeight;
          const height = Math.max((durationMinutes / 60) * rowHeight - 8, 52);
          const left = 96 + dayIndex * columnWidth + 8;

          return {
            ...appointment,
            top,
            left,
            height,
            width: columnWidth - 16,
            startLabel: String(appointment.appointmentTime).slice(0, 5),
            endLabel: (() => {
              const endMinutes = startMinutes + durationMinutes;
              const endHour = String(Math.floor(endMinutes / 60)).padStart(2, "0");
              const endMinute = String(endMinutes % 60).padStart(2, "0");
              return `${endHour}:${endMinute}`;
            })(),
            fullTimeLabel: `${String(appointment.appointmentTime).slice(0, 5)} - ${(() => {
              const endMinutes = startMinutes + durationMinutes;
              const endHour = String(Math.floor(endMinutes / 60)).padStart(2, "0");
              const endMinute = String(endMinutes % 60).padStart(2, "0");
              return `${endHour}:${endMinute}`;
            })()}`
          };
        })
        .filter(Boolean),
    [appointments, dayHeaders, servicesById]
  );

  useEffect(() => {
    if (!scrollContainerRef.current || currentMarker.hour < defaultStartHour || currentMarker.hour > defaultEndHour) {
      return;
    }

    const nextScrollTop = Math.max((currentMarker.hour - defaultStartHour) * rowHeight - scrollContainerRef.current.clientHeight * 0.3, 0);
    scrollContainerRef.current.scrollTo({ top: nextScrollTop, behavior: "smooth" });
  }, [currentMarker]);

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))]">
      <div className="border-b border-white/10">
        <div
          className="grid"
          style={{ gridTemplateColumns: `96px repeat(${dayHeaders.length || 7}, minmax(${columnWidth}px, 1fr))` }}
        >
          <div className="border-r border-white/8 px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--text-muted)]">
            Hora
          </div>
          {dayHeaders.map((day, index) => (
            <div
              key={day.key}
              className={`px-4 py-4 ${index < dayHeaders.length - 1 ? "border-r border-white/8" : ""} ${
                currentMarker.dayIndex === index ? "bg-cyan-400/[0.05]" : ""
              }`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--text-muted)]">{day.label}</p>
              <p className="mt-1 text-base font-semibold text-white">{day.day}</p>
            </div>
          ))}
        </div>
      </div>

      <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-auto">
        <div
          className="relative min-w-max"
          style={{ width: `${96 + dayHeaders.length * columnWidth}px`, height: `${totalHeight}px` }}
        >
          {hours.map((hour, rowIndex) => (
            <div
              key={hour}
              className="absolute inset-x-0 grid border-b border-white/6"
              style={{
                top: `${rowIndex * rowHeight}px`,
                height: `${rowHeight}px`,
                gridTemplateColumns: `96px repeat(${dayHeaders.length || 7}, minmax(${columnWidth}px, 1fr))`
              }}
            >
              <TimeSlot label={formatHourLabel(hour)} isCurrent={currentMarker.hour === hour} />
              {dayHeaders.map((day, index) => (
                <div
                  key={`${day.key}-${hour}`}
                  className={`border-r border-white/6 ${index === currentMarker.dayIndex && currentMarker.hour === hour ? "bg-cyan-400/[0.04]" : ""}`}
                />
              ))}
            </div>
          ))}

          {currentMarker.dayIndex >= 0 && currentMarker.hour >= defaultStartHour && currentMarker.hour <= defaultEndHour ? (
            <div
              className="pointer-events-none absolute z-10"
              style={{
                top: `${(currentMarker.hour - defaultStartHour) * rowHeight + (currentMarker.minuteOffset / 60) * rowHeight}px`,
                left: `${96 + currentMarker.dayIndex * columnWidth}px`,
                width: `${columnWidth}px`
              }}
            >
              <div className="relative flex items-center">
                <span className="absolute -left-1.5 h-3 w-3 rounded-full border-2 border-slate-950 bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.45)]" />
                <div className="h-px w-full bg-gradient-to-r from-cyan-300 via-cyan-200/70 to-transparent" />
              </div>
            </div>
          ) : null}

          {positionedAppointments.map((appointment, index) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              style={{
                top: `${appointment.top}px`,
                left: `${appointment.left}px`,
                width: `${appointment.width}px`,
                height: `${appointment.height}px`,
                animationDelay: `${index * 45}ms`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
