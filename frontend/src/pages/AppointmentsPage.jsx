import { useMemo, useState } from "react";
import { Link2, Pencil, PlusCircle, Trash2, XCircle } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { apiRequest, getCollection } from "../lib/api";
import { formatDateForInput, formatDateTime } from "../lib/formatters";
import { Badge } from "../components/Badge";
import { EmptyState } from "../components/EmptyState";
import { EntityCard } from "../components/EntityCard";
import { ErrorState } from "../components/ErrorState";
import { FormField } from "../components/FormField";
import { GenerateLinkModal } from "../components/GenerateLinkModal";
import { LoadingState } from "../components/LoadingState";
import { Modal } from "../components/Modal";
import { SectionToolbar } from "../components/SectionToolbar";

function buildInitialForm() {
  return {
    id: null,
    patientId: "",
    serviceId: "",
    userId: "",
    appointmentDate: "",
    appointmentTime: "",
    status: "confirmed",
    notes: ""
  };
}

export function AppointmentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [form, setForm] = useState(buildInitialForm());
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const appointments = useApi((signal) => getCollection("/appointments", { query: { limit: 500 }, signal }), []);
  const patients = useApi((signal) => getCollection("/patients", { signal }), []);
  const services = useApi((signal) => getCollection("/services", { signal }), []);
  const users = useApi((signal) => getCollection("/users", { signal }), []);
  const links = useApi((signal) => getCollection("/appointment-links", { signal }), []);

  const appointmentCards = useMemo(() => appointments.data?.data || [], [appointments.data]);

  function openCreateModal() {
    setForm({
      ...buildInitialForm(),
      userId: users.data?.data?.[0]?.id ? String(users.data.data[0].id) : ""
    });
    setSubmitError("");
    setIsModalOpen(true);
  }

  function openEditModal(appointment) {
    setForm({
      id: appointment.id,
      patientId: String(appointment.patientId),
      serviceId: String(appointment.serviceId),
      userId: String(appointment.userId),
      appointmentDate: formatDateForInput(appointment.appointmentDate),
      appointmentTime: String(appointment.appointmentTime).slice(0, 5),
      status: appointment.status || "confirmed",
      notes: appointment.notes || ""
    });
    setSubmitError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setSubmitError("");
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");
    setIsSaving(true);

    try {
      const payload = {
        patientId: form.patientId,
        serviceId: Number(form.serviceId),
        userId: form.userId,
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime,
        status: form.status,
        notes: form.notes
      };

      const response = form.id
        ? await apiRequest(`/appointments/${form.id}`, { method: "PUT", body: payload })
        : await apiRequest("/appointments", { method: "POST", body: payload });

      const savedAppointment = response.data;

      appointments.setData((current) => {
        if (!current) {
          return current;
        }

        const exists = current.data.some((appointment) => appointment.id === savedAppointment.id);

        return {
          ...current,
          data: exists
            ? current.data.map((appointment) => (appointment.id === savedAppointment.id ? savedAppointment : appointment))
            : [savedAppointment, ...current.data],
          meta: {
            ...current.meta,
            count: exists ? current.meta.count : current.meta.count + 1
          }
        };
      });

      closeModal();
      appointments.refresh();
    } catch (error) {
      setSubmitError(error.message || "Não foi possível salvar o agendamento.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCancelAppointment(appointment) {
    if (!window.confirm(`Cancelar o agendamento de ${appointment.patientName}?`)) {
      return;
    }

    setSubmitError("");

    try {
      const response = await apiRequest(`/appointments/${appointment.id}/cancel`, { method: "PATCH" });
      const canceledAppointment = response.data;

      appointments.setData((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          data: current.data.map((item) => (item.id === canceledAppointment.id ? canceledAppointment : item))
        };
      });
      appointments.refresh();
    } catch (error) {
      setSubmitError(error.message || "Não foi possível cancelar o agendamento.");
    }
  }

  async function handleDeleteAppointment(appointment) {
    if (!window.confirm(`Apagar definitivamente o agendamento de ${appointment.patientName}?`)) {
      return;
    }

    setSubmitError("");

    try {
      await apiRequest(`/appointments/${appointment.id}`, { method: "DELETE" });

      appointments.setData((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          data: current.data.filter((item) => item.id !== appointment.id),
          meta: {
            ...current.meta,
            count: Math.max(0, current.meta.count - 1)
          }
        };
      });
      appointments.refresh();
    } catch (error) {
      setSubmitError(error.message || "Não foi possível apagar o agendamento.");
    }
  }

  if (appointments.isLoading || patients.isLoading || services.isLoading || users.isLoading || links.isLoading) {
    return <LoadingState label="Carregando agendamentos..." />;
  }

  if (appointments.error || patients.error || services.error || users.error || links.error) {
    return <ErrorState message={appointments.error || patients.error || services.error || users.error || links.error} />;
  }

  return (
    <div className="space-y-6">
      <SectionToolbar
        title="Agendamentos"
        subtitle={`${appointments.data.meta.count} agendamentos carregados com suporte a criação, edição e links públicos controlados.`}
        actions={
          <>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-[color:var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <PlusCircle size={18} />
              Adicionar agendamento
            </button>
            <button
              type="button"
              onClick={() => setIsLinkModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-emerald-600 hover:to-teal-700"
            >
              <Link2 size={18} />
              Gerar link público
            </button>
          </>
        }
      />

      {submitError ? <p className="text-sm text-rose-300">{submitError}</p> : null}

      {appointmentCards.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {appointmentCards.map((appointment) => (
            <EntityCard
              key={appointment.id}
              title={appointment.patientName}
              subtitle={appointment.serviceName}
              meta={[
                { label: "Quando", value: formatDateTime(appointment.appointmentDate, appointment.appointmentTime) },
                { label: "Profissional", value: appointment.userName }
              ]}
              actions={
                <div className="flex items-center gap-2">
                  <Badge value={appointment.status || "sem status"} />
                  <button
                    type="button"
                    onClick={() => openEditModal(appointment)}
                    className="rounded-2xl border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10"
                  >
                    <Pencil size={16} />
                  </button>
                  {appointment.status !== "canceled" ? (
                    <button
                      type="button"
                      onClick={() => handleCancelAppointment(appointment)}
                      className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-2 text-amber-200 transition hover:bg-amber-400/20"
                      title="Cancelar agendamento"
                    >
                      <XCircle size={16} />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleDeleteAppointment(appointment)}
                    className="rounded-2xl border border-rose-300/20 bg-rose-500/10 p-2 text-rose-200 transition hover:bg-rose-500/20"
                    title="Apagar agendamento"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              }
            >
              {appointment.notes ? <p className="text-sm text-[color:var(--text-soft)]">{appointment.notes}</p> : null}
            </EntityCard>
          ))}
        </div>
      ) : (
        <EmptyState title="Nenhum agendamento encontrado" description="Crie um novo agendamento para começar a organizar a agenda." />
      )}

      <Modal
        open={isModalOpen}
        title={form.id ? "Editar agendamento" : "Novo agendamento"}
        subtitle="Os dados serão persistidos diretamente na tabela de agendamentos."
        onClose={closeModal}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-3">
            <FormField label="Paciente">
              <select
                value={form.patientId}
                onChange={(event) => updateField("patientId", event.target.value)}
                className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
                required
              >
                <option value="">Selecione</option>
                {patients.data.data.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Serviço">
              <select
                value={form.serviceId}
                onChange={(event) => updateField("serviceId", event.target.value)}
                className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
                required
              >
                <option value="">Selecione</option>
                {services.data.data.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Profissional">
              <select
                value={form.userId}
                onChange={(event) => updateField("userId", event.target.value)}
                className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
                required
              >
                <option value="">Selecione</option>
                {users.data.data.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <FormField label="Data">
              <input
                type="date"
                value={form.appointmentDate}
                onChange={(event) => updateField("appointmentDate", event.target.value)}
                className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
                required
              />
            </FormField>

            <FormField label="Hora">
              <input
                type="time"
                value={form.appointmentTime}
                onChange={(event) => updateField("appointmentTime", event.target.value)}
                className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
                required
              />
            </FormField>

            <FormField label="Status">
              <select
                value={form.status}
                onChange={(event) => updateField("status", event.target.value)}
                className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
              >
                <option value="confirmed">Confirmado</option>
                <option value="pending">Pendente</option>
                <option value="completed">Concluído</option>
                <option value="canceled">Cancelado</option>
              </select>
            </FormField>
          </div>

          <FormField label="Observações">
            <textarea
              rows={4}
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              className="field-shell w-full rounded-2xl px-4 py-3 text-white outline-none"
            />
          </FormField>

          {submitError ? <p className="text-sm text-rose-300">{submitError}</p> : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-2xl bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {isSaving ? "Salvando..." : form.id ? "Salvar alterações" : "Criar agendamento"}
            </button>
          </div>
        </form>
      </Modal>

      <GenerateLinkModal
        open={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        patients={patients.data?.data || []}
        services={services.data?.data || []}
        onSuccess={() => links.refresh()}
      />
    </div>
  );
}
