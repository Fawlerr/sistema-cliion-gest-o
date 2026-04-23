export function Panel({ title, subtitle, children, actions, className = "" }) {
  return (
    <section className={`panel-border glass-panel rounded-[28px] p-5 md:p-6 ${className}`}>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="fancy-title text-xl font-semibold text-white">{title}</h2>
          {subtitle ? <p className="mt-2 max-w-3xl text-sm text-[color:var(--text-soft)]">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
