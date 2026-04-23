import { CalendarRange, DollarSign, Users, Wallet } from "lucide-react";

const icons = {
  patients: Users,
  appointments: CalendarRange,
  revenue: DollarSign,
  payments: Wallet
};

const toneStyles = {
  cyan: "from-[#2f6f85] to-[#5c8d9d] text-white",
  violet: "from-[#214f62] to-[#2f6f85] text-white",
  emerald: "from-[#5a9d8b] to-[#2f6f85] text-white",
  amber: "from-[#e8b072] to-[#eea88c] text-[#214f62]"
};

export function MetricCard({ item, index }) {
  const Icon = icons[item.id];

  return (
    <article
      className="glass-panel animate-floatIn rounded-[30px] border border-[color:var(--line)] p-5 shadow-glow"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[color:var(--text-soft)]">{item.title}</p>
          <h3 className="mt-4 text-3xl font-semibold text-[color:var(--accent-deep)]">
            {item.prefix}
            {Number(item.value).toLocaleString("en-US")}
          </h3>
        </div>

        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${toneStyles[item.tone]}`}>
          <Icon size={22} />
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="rounded-full border border-emerald-600/10 bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
          {item.change}
        </span>
        <span className="status-dot animate-pulseGlow bg-[color:var(--accent-warm)]" />
      </div>
    </article>
  );
}
