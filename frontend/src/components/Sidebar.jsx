import logo from "../../images/logo.png";

export function Sidebar({ items, activePage, onChange }) {
  return (
    <aside className="panel-border glass-panel flex h-full flex-col rounded-[32px] p-5">
      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
        <img src={logo} alt="Cliion" className="max-h-16 w-auto object-contain" />
        <div className="mt-5 rounded-[24px] bg-[linear-gradient(145deg,rgba(124,130,255,0.16),rgba(56,189,248,0.12))] p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--text-muted)]">Cliion</p>
          <p className="mt-3 text-sm leading-6 text-[color:var(--text-soft)]">
            Gestao clinica com dados operacionais em tempo real, fluxo de equipe focado e um painel profissional.
          </p>
        </div>
      </div>

      <nav className="mt-6 space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activePage;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`w-full rounded-[22px] px-4 py-3 text-left transition duration-200 ${
                isActive
                  ? "bg-[linear-gradient(135deg,rgba(124,130,255,0.28),rgba(56,189,248,0.18))] text-white shadow-[0_18px_48px_rgba(45,68,165,0.35)]"
                  : "bg-transparent text-[color:var(--text-soft)] hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                    isActive ? "bg-white/10 text-white" : "bg-white/[0.05] text-[color:var(--accent-secondary)]"
                  }`}
                >
                  <Icon size={18} />
                </span>
                <div>
                  <p className="font-semibold">{item.label}</p>
                  <p className={`text-xs ${isActive ? "text-indigo-100/80" : "text-[color:var(--text-muted)]"}`}>
                    {item.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
