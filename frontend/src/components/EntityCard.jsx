export function EntityCard({ title, subtitle, meta = [], actions, children }) {
  return (
    <article className="panel-border glass-panel rounded-[26px] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          {subtitle ? <p className="mt-2 text-sm text-[color:var(--text-soft)]">{subtitle}</p> : null}
        </div>
        {actions}
      </div>

      {meta.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {meta.map((item) => (
            <span
              key={`${item.label}-${item.value}`}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[color:var(--text-soft)]"
            >
              <strong className="mr-1 text-white">{item.label}:</strong>
              {item.value}
            </span>
          ))}
        </div>
      ) : null}

      {children ? <div className="mt-5">{children}</div> : null}
    </article>
  );
}
