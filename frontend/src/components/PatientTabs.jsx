const tabs = [
  { id: "records", label: "Prontuarios" },
  { id: "payments", label: "Pagamentos" }
];

export function PatientTabs({ activeTab, onChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
              isActive
                ? "bg-[color:var(--accent)] text-white shadow-[0_16px_30px_rgba(47,111,133,0.22)]"
                : "border border-white/10 bg-white/[0.04] text-[color:var(--text-soft)] hover:bg-white/[0.08] hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
