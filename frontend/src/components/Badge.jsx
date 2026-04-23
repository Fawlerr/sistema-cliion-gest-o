const variants = {
  paid: "border-emerald-400/20 bg-emerald-500/12 text-emerald-200",
  pending: "border-amber-400/20 bg-amber-500/12 text-amber-200",
  confirmed: "border-cyan-400/20 bg-cyan-500/12 text-cyan-200",
  canceled: "border-rose-400/20 bg-rose-500/12 text-rose-200",
  completed: "border-emerald-400/20 bg-emerald-500/12 text-emerald-200",
  default: "border-white/10 bg-white/5 text-slate-200"
};

const labels = {
  paid: "Pago",
  pending: "Pendente",
  confirmed: "Confirmado",
  canceled: "Cancelado",
  completed: "Concluido",
  "sem status": "Sem status"
};

export function Badge({ value }) {
  const key = String(value || "").toLowerCase();
  const style = variants[key] || variants.default;

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${style}`}>
      {labels[key] || value || "Desconhecido"}
    </span>
  );
}
