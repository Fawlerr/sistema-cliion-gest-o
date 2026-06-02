export function LoadingState({ label = "Carregando dados da clinica..." }) {
  return (
    <div className="panel-border glass-panel flex min-h-[260px] items-center justify-center rounded-[28px] p-8">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-[color:var(--accent-secondary)]" />
        </div>
        <p className="mt-4 text-sm text-[color:var(--text-soft)]">{label}</p>
      </div>
    </div>
  );
}
