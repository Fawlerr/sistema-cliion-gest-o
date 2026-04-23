import { Bell, Search } from "lucide-react";

export function Topbar({ title, description }) {
  return (
    <header className="panel-border glass-panel mb-6 rounded-[30px] p-5 md:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--text-muted)]">Central da clinica</p>
          <h1 className="mt-3 fancy-title text-3xl font-semibold text-white md:text-4xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--text-soft)]">{description}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,320px)_auto]">
          <div className="field-shell flex items-center gap-3 rounded-[18px] px-4 py-3">
            <Search size={18} className="text-[color:var(--accent-secondary)]" />
            <span className="text-sm text-[color:var(--text-soft)]">Conectado ao banco PostgreSQL da clinica</span>
          </div>
          <div className="rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3">
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="rounded-[14px] border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-soft)] transition hover:bg-white/10 hover:text-white"
              >
                Site publico
              </a>
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(124,130,255,0.24),rgba(56,189,248,0.18))]">
                <Bell size={18} className="text-white" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
