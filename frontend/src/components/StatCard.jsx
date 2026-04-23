import { formatCurrency } from "../lib/formatters";

export function StatCard({ title, value, type = "number", accent = "from-indigo-500 via-violet-500 to-sky-400" }) {
  const displayValue = type === "currency" ? formatCurrency(value) : Number(value || 0).toLocaleString("pt-BR");

  return (
    <article className="panel-border glass-panel animate-enter rounded-[26px] p-5">
      <div className={`mb-6 h-1.5 rounded-full bg-gradient-to-r ${accent}`} />
      <p className="text-sm uppercase tracking-[0.24em] text-[color:var(--text-muted)]">{title}</p>
      <p className="mt-4 fancy-title text-3xl font-semibold text-white">{displayValue}</p>
    </article>
  );
}
