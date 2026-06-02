export function TimeSlot({ label, isCurrent = false }) {
  return (
    <div
      className={`flex h-[84px] items-start justify-end border-r px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] ${
        isCurrent ? "border-cyan-400/20 text-cyan-200" : "border-white/8 text-[color:var(--text-muted)]"
      }`}
    >
      {label}
    </div>
  );
}
