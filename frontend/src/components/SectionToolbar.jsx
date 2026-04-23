export function SectionToolbar({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="fancy-title text-2xl font-semibold text-white">{title}</h2>
        {subtitle ? <p className="mt-2 text-sm text-[color:var(--text-soft)]">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
