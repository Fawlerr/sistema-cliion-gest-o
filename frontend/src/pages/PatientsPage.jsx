import { useEffect, useMemo, useState } from "react";
import { useApi } from "../hooks/useApi";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { apiRequest, getCollection, getResource } from "../lib/api";
import { ageToBirthDate, calculateAge, formatDateForInput } from "../lib/formatters";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { PatientDetails } from "../components/PatientDetails";
import { PatientList } from "../components/PatientList";
import { navigateTo } from "../lib/navigation";

function buildInitialForm() {
  return {
    id: null,
    name: "",
    age: "",
    email: "",
    phone: "",
    birthDate: "",
    address: ""
  };
}

const patientTabStorageKey = "clinic-dashboard-demo.patient-tab";

function setStoredPatientTab(tabId) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(patientTabStorageKey, tabId);
}

function getStoredPatientTab() {
  if (typeof window === "undefined") {
    return "records";
  }

  const storedTab = window.sessionStorage.getItem(patientTabStorageKey) || "records";
  return storedTab === "payments" ? "payments" : "records";
}

export function PatientsPage({ patientId = null }) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(buildInitialForm());
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  useEffect(() => {
    setSearch(debouncedSearch.trim());
  }, [debouncedSearch]);

  const patients = useApi(
    (signal) => getCollection("/patients", { query: { search }, signal }),
    [search]
  );
  const patientDetails = useApi(
    (signal) => (patientId ? getResource(`/patients/${patientId}`, { signal }) : Promise.resolve(null)),
    [patientId]
  );
  const appointments = useApi((signal) => getCollection("/appointments", { query: { limit: 500 }, signal }), []);
  const payments = useApi((signal) => getCollection("/payments", { signal }), []);
  const services = useApi((signal) => getCollection("/services", { signal }), []);

  const patientCards = useMemo(() => patients.data?.data || [], [patients.data]);
  const currentPatientAppointments = useMemo(
    () => (appointments.data?.data || []).filter((appointment) => String(appointment.patientId) === String(patientId)),
    [appointments.data, patientId]
  );
  const currentPatientPayments = useMemo(
    () => (payments.data?.data || []).filter((payment) => String(payment.patientId) === String(patientId)),
    [payments.data, patientId]
  );
  const servicesById = useMemo(
    () => Object.fromEntries((services.data?.data || []).map((service) => [service.id, service])),
    [services.data]
  );

  function openCreateModal() {
    setForm(buildInitialForm());
    setSubmitError("");
    setIsModalOpen(true);
  }

  function openEditModal(patient) {
    setForm({
      id: patient.id,
      name: patient.name || "",
      age: calculateAge(patient.birthDate),
      email: patient.email || "",
      phone: patient.phone || "",
      birthDate: formatDateForInput(patient.birthDate),
      address: patient.address || ""
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

  function handleAgeChange(value) {
    setForm((current) => ({
      ...current,
      age: value,
      birthDate: value ? ageToBirthDate(value) : ""
    }));
  }

  function handleBirthDateChange(value) {
    setForm((current) => ({
      ...current,
      birthDate: value,
      age: value ? calculateAge(value) : ""
    }));
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    setSearch(searchInput.trim());
  }

  function handleViewDetails(targetPatientId, initialTab = "records") {
    setStoredPatientTab(initialTab);
    navigateTo(`/admin/patients/${targetPatientId}`);
  }

  function handleBackToList() {
    setStoredPatientTab("records");
    navigateTo("/admin/patients");
  }

  async function handleDeletePatient(patient) {
    if (!window.confirm(`Excluir definitivamente o paciente ${patient.name}? Essa ação também remove agendamentos e prontuários vinculados.`)) {
      return;
    }

    setSubmitError("");

    try {
      await apiRequest(`/patients/${patient.id}`, { method: "DELETE" });

      patients.setData((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          data: current.data.filter((item) => item.id !== patient.id),
          meta: {
            ...current.meta,
            count: Math.max(0, current.meta.count - 1)
          }
        };
      });
      patients.refresh();
      appointments.refresh();
      payments.refresh();
    } catch (error) {
      setSubmitError(error.message || "Não foi possível excluir o paciente.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setSubmitError("");

    try {
      const payload = {
        name: form.name,
        age: form.age,
        email: form.email,
        phone: form.phone,
        birthDate: form.birthDate || ageToBirthDate(form.age),
        address: form.address
      };

      let response;

      if (form.id) {
        response = await apiRequest(`/patients/${form.id}`, {
          method: "PUT",
          body: payload
        });
      } else {
        response = await apiRequest("/patients", {
          method: "POST",
          body: payload
        });
      }

      const savedPatient = response.data;

      patients.setData((current) => {
        if (!current) {
          return current;
        }

        const exists = current.data.some((patient) => patient.id === savedPatient.id);
        const nextData = exists
          ? current.data.map((patient) => (patient.id === savedPatient.id ? savedPatient : patient))
          : [savedPatient, ...current.data];

        return {
          ...current,
          data: nextData,
          meta: {
            ...current.meta,
            count: exists ? current.meta.count : current.meta.count + 1
          }
        };
      });

      closeModal();
      patients.refresh();
    } catch (error) {
      setSubmitError(error.message || "Não foi possível salvar o paciente.");
    } finally {
      setIsSaving(false);
    }
  }

  if (patients.isLoading || appointments.isLoading || payments.isLoading || services.isLoading || (patientId && patientDetails.isLoading)) {
    return <LoadingState label="Carregando cadastro de pacientes..." />;
  }

  if (patients.error || appointments.error || payments.error || services.error || patientDetails.error) {
    return <ErrorState message={patients.error || appointments.error || payments.error || services.error || patientDetails.error} />;
  }

  if (patientId) {
    return (
      <PatientDetails
        patient={patientDetails.data}
        appointments={currentPatientAppointments}
        payments={currentPatientPayments}
        servicesById={servicesById}
        onBack={handleBackToList}
        initialTab={getStoredPatientTab()}
      />
    );
  }

  return (
    <PatientList
      patients={patientCards}
      searchInput={searchInput}
      onSearchInputChange={setSearchInput}
      onSearchSubmit={handleSearchSubmit}
      onOpenCreate={openCreateModal}
      onOpenEdit={openEditModal}
      onDeletePatient={handleDeletePatient}
      onViewDetails={handleViewDetails}
      isModalOpen={isModalOpen}
      form={form}
      onCloseModal={closeModal}
      onUpdateField={updateField}
      onAgeChange={handleAgeChange}
      onBirthDateChange={handleBirthDateChange}
      onSubmit={handleSubmit}
      submitError={submitError}
      isSaving={isSaving}
    />
  );
}
