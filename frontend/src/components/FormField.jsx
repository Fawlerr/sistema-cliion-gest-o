export function FormField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[color:var(--text-soft)]">{label}</span>
      {children}
    </label>
  );
}
