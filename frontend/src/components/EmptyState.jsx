export function EmptyState({ title, description }) {
  return (
    <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-6 py-12 text-center">
      <p className="text-lg font-semibold text-white">{title}</p>
      <p className="mx-auto mt-3 max-w-xl text-sm text-[color:var(--text-soft)]">{description}</p>
    </div>
  );
}
