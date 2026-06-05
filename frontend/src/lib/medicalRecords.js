import { apiRequest, getCollection } from "./api";

const recordTypeOptions = [
  { value: "fisioterapeutica", label: "Avaliação Fisioterapêutica" },
  { value: "osteopatia", label: "Osteopatia" },
  { value: "pelvica", label: "Pélvica" },
  { value: "atm", label: "ATM" },
  { value: "vestibular", label: "Vestibular" },
  { value: "funcional", label: "Funcional" },
  { value: "evolucao", label: "Evolução de Atendimento" }
];

const dynamicFieldsByType = {
  fisioterapeutica: [
    { name: "mainComplaint", label: "Queixa principal", type: "textarea" },
    { name: "history", label: "Histórico", type: "textarea" },
    { name: "diagnosis", label: "Diagnóstico", type: "textarea" },
    { name: "treatmentPlan", label: "Plano de tratamento", type: "textarea" }
  ],
  osteopatia: [
    { name: "mainComplaint", label: "Queixa principal", type: "textarea" },
    { name: "structuralFindings", label: "Achados estruturais", type: "textarea" },
    { name: "osteopathicDiagnosis", label: "Diagnóstico osteopático", type: "textarea" },
    { name: "treatmentPlan", label: "Plano de tratamento", type: "textarea" }
  ],
  pelvica: [
    { name: "mainComplaint", label: "Queixa principal", type: "textarea" },
    { name: "symptoms", label: "Sintomas", type: "textarea" },
    { name: "assessmentFindings", label: "Achados da avaliação", type: "textarea" },
    { name: "treatmentPlan", label: "Plano de tratamento", type: "textarea" }
  ],
  atm: [
    { name: "mainComplaint", label: "Queixa principal", type: "textarea" },
    { name: "painPattern", label: "Padrão de dor", type: "textarea" },
    { name: "mobility", label: "Mobilidade", type: "textarea" },
    { name: "treatmentPlan", label: "Plano de tratamento", type: "textarea" }
  ],
  vestibular: [
    { name: "mainComplaint", label: "Queixa principal", type: "textarea" },
    { name: "symptoms", label: "Sintomas vestibulares", type: "textarea" },
    { name: "tests", label: "Testes aplicados", type: "textarea" },
    { name: "treatmentPlan", label: "Plano de tratamento", type: "textarea" }
  ],
  funcional: [
    { name: "mainComplaint", label: "Objetivo funcional", type: "textarea" },
    { name: "limitations", label: "Limitações", type: "textarea" },
    { name: "assessmentFindings", label: "Achados", type: "textarea" },
    { name: "treatmentPlan", label: "Plano de tratamento", type: "textarea" }
  ],
  evolucao: [
    { name: "sessionDescription", label: "Descrição do atendimento", type: "textarea" },
    { name: "observations", label: "Observações", type: "textarea" },
    { name: "technicalBehavior", label: "Comportamento técnico", type: "textarea" }
  ]
};

const fieldLabels = Object.values(dynamicFieldsByType).reduce((accumulator, fields) => {
  fields.forEach((field) => {
    accumulator[field.name] = field.label;
  });
  return accumulator;
}, {});

export function getMedicalRecordTypeOptions() {
  return recordTypeOptions;
}

export function getMedicalRecordFieldsByType(recordType) {
  return dynamicFieldsByType[recordType] || [];
}

export function getMedicalRecordTypeLabel(recordType) {
  return recordTypeOptions.find((option) => option.value === recordType)?.label || recordType;
}

export async function listMedicalRecords(patientId, options = {}) {
  const records = await getCollection(`/patients/${patientId}/medical-records`, options);
  return records.data;
}

export async function createMedicalRecord({ patientId, type, date, notes, data }) {
  const payload = await apiRequest(`/patients/${patientId}/medical-records`, {
    method: "POST",
    body: { type, date, notes, data }
  });

  return payload.data;
}

export function buildMedicalRecordSummary(record) {
  const values = Object.values(record.data || {}).filter(Boolean);
  if (values.length) {
    return String(values[0]).slice(0, 160);
  }

  return record.notes || "Sem resumo disponível.";
}

export function getMedicalRecordFieldLabel(fieldName) {
  return fieldLabels[fieldName] || fieldName;
}

export function getMedicalRecordSections(record) {
  const dynamicFields = getMedicalRecordFieldsByType(record.type);
  const sections = dynamicFields
    .map((field) => ({
      title: field.label,
      value: record.data?.[field.name] || ""
    }))
    .filter((section) => section.value);

  if (record.notes) {
    sections.push({
      title: "Observações gerais",
      value: record.notes
    });
  }

  return sections;
}
