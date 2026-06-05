import { Panel } from "./Panel";

const statusStyles = {
  confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  canceled: "bg-rose-100 text-rose-700 border-rose-200"
};

export function AppointmentsTable({ appointments }) {
  return (
    <Panel title="Agendamentos recentes" subtitle="Consultas mais recentes registradas no sistema">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-3 text-left">
          <thead>
            <tr className="text-xs uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
              <th className="px-4">Paciente</th>
              <th className="px-4">Data</th>
              <th className="px-4">Serviço</th>
              <th className="px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="soft-card rounded-2xl text-[color:var(--text-soft)]">
                <td className="rounded-l-2xl px-4 py-4">
                  <div className="font-medium text-[color:var(--accent-deep)]">{appointment.patientName}</div>
                  <div className="text-sm text-[color:var(--text-muted)]">{appointment.therapist}</div>
                </td>
                <td className="px-4 py-4 text-sm">{appointment.date}</td>
                <td className="px-4 py-4 text-sm">{appointment.service}</td>
                <td className="rounded-r-2xl px-4 py-4">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[appointment.status]}`}>
                    {appointment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
