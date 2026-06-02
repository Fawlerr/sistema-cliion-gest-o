import { useEffect, useRef, useState } from "react";
import { Clock3, UserRound } from "lucide-react";
import { Badge } from "./Badge";

function getTooltipPosition(targetRect, tooltipRect) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const gap = 12;
  const preferredTop = targetRect.top + window.scrollY - tooltipRect.height - gap;
  const fallbackTop = targetRect.bottom + window.scrollY + gap;
  const top = preferredTop > window.scrollY ? preferredTop : fallbackTop;
  const centeredLeft = targetRect.left + window.scrollX + targetRect.width / 2 - tooltipRect.width / 2;
  const minLeft = window.scrollX + 16;
  const maxLeft = window.scrollX + viewportWidth - tooltipRect.width - 16;

  return {
    top: Math.min(top, window.scrollY + viewportHeight - tooltipRect.height - 16),
    left: Math.max(minLeft, Math.min(centeredLeft, maxLeft))
  };
}

export function AppointmentCard({ appointment, style }) {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({ top: 0, left: 0 });
  const hoverTimeoutRef = useRef(null);
  const cardRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!(isTooltipVisible || isPinned) || !cardRef.current || !tooltipRef.current) {
      return undefined;
    }

    const updatePosition = () => {
      const nextPosition = getTooltipPosition(
        cardRef.current.getBoundingClientRect(),
        tooltipRef.current.getBoundingClientRect()
      );
      setTooltipStyle(nextPosition);
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isPinned, isTooltipVisible]);

  useEffect(() => () => {
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (!(isTooltipVisible || isPinned)) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (
        cardRef.current?.contains(event.target) ||
        tooltipRef.current?.contains(event.target)
      ) {
        return;
      }

      setIsPinned(false);
      setIsTooltipVisible(false);
    }

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [isPinned, isTooltipVisible]);

  function handleMouseEnter() {
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
    }

    hoverTimeoutRef.current = window.setTimeout(() => {
      setIsTooltipVisible(true);
    }, 120);
  }

  function handleMouseLeave() {
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
    }

    if (!isPinned) {
      setIsTooltipVisible(false);
    }
  }

  function handleClick() {
    setIsPinned((current) => !current);
    setIsTooltipVisible(true);
  }

  return (
    <>
      <button
        ref={cardRef}
        type="button"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="group absolute z-20 overflow-hidden rounded-[16px] border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(157,240,255,0.16),rgba(73,157,214,0.12))] px-2.5 py-2 text-left shadow-[0_12px_28px_rgba(2,12,27,0.22)] opacity-0 transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:border-cyan-200/30 hover:bg-[linear-gradient(180deg,rgba(157,240,255,0.22),rgba(73,157,214,0.16))] animate-[page-fade-in_240ms_ease-out_forwards]"
        style={style}
      >
        <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-cyan-300 via-sky-300 to-emerald-300" />
        <div className="pl-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-white">{appointment.patientName}</p>
              <p className="mt-1 truncate text-[11px] text-cyan-100/80">{appointment.serviceName}</p>
            </div>
            <div className="scale-90 origin-top-right">
              <Badge value={appointment.status || "sem status"} />
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
            <Clock3 size={12} />
            <span>
              {appointment.startLabel}
            </span>
          </div>
        </div>
      </button>

      {isTooltipVisible || isPinned ? (
        <div
          ref={tooltipRef}
          className="pointer-events-none fixed z-50 w-[280px] rounded-[20px] border border-white/10 bg-slate-950/96 px-4 py-4 text-sm text-slate-100 shadow-[0_24px_60px_rgba(0,0,0,0.42)] backdrop-blur-xl animate-[page-fade-in_180ms_ease-out]"
          style={tooltipStyle}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-white">{appointment.patientName}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.24em] text-cyan-200/70">{appointment.serviceName}</p>
            </div>
            <Badge value={appointment.status || "sem status"} />
          </div>

          <div className="mt-4 space-y-2 text-sm text-slate-300">
            <p className="flex items-center gap-2">
              <Clock3 size={14} className="text-cyan-200" />
              <span>{appointment.fullTimeLabel}</span>
            </p>
            <p className="flex items-center gap-2">
              <UserRound size={14} className="text-cyan-200" />
              <span>{appointment.userName}</span>
            </p>
            {appointment.phone ? <p>Telefone: {appointment.phone}</p> : null}
            {appointment.notes ? <p className="leading-6 text-slate-400">{appointment.notes}</p> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
