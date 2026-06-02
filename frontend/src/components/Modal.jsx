export function Modal({ open, title, subtitle, children, onClose }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 px-3 py-3 backdrop-blur-sm md:items-center md:px-4 md:py-6">
      <button type="button" aria-label="Fechar modal" className="absolute inset-0 cursor-default" onClick={onClose} />
      <div className="panel-border glass-panel relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] p-5 md:p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="fancy-title text-2xl font-semibold text-white">{title}</h2>
            {subtitle ? <p className="mt-2 text-sm text-[color:var(--text-soft)]">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10"
          >
            Fechar
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
