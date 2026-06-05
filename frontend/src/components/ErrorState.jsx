export function ErrorState({ message }) {
  return (
    <div className="panel-border glass-panel rounded-[28px] p-8">
      <p className="text-lg font-semibold text-rose-300">Não foi possível carregar esta seção.</p>
      <p className="mt-3 text-sm text-rose-100/80">{message}</p>
    </div>
  );
}
