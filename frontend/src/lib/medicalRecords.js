import { apiRequest, getCollection } from "./api";

const recordTypeOptions = [
  { value: "fisioterapeutica", label: "Avaliação Traumato-Ortopédica" },
  { value: "pelvica", label: "Avaliação Pélvica" },
  { value: "osteopatia", label: "Osteopatia" },
  { value: "atm", label: "ATM" },
  { value: "vestibular", label: "Vestibular" },
  { value: "funcional", label: "Funcional" },
  { value: "evolucao", label: "Evolução de Atendimento" }
];

const dynamicFieldsByType = {
  fisioterapeutica: [
    { name: "doctorName", label: "Médico responsável", type: "text" },
    { name: "physioName", label: "Fisioterapeuta responsável", type: "text" },
    { name: "mainComplaint", label: "Queixa principal", type: "textarea" },
    { name: "hda", label: "HDA (História da Doença Atual)", type: "textarea" },
    { name: "painScale", label: "Escala Numérica de Dor (0 a 10)", type: "scale", min: 0, max: 10 },
    {
      name: "comorbidities",
      label: "Comorbidades",
      type: "checkbox-group",
      options: ["HAS", "Diabetes", "Cardiopatias", "Reumatológicas", "Ortopédicas", "Respiratórias"]
    },
    { name: "otherComorbidities", label: "Outras comorbidades", type: "text" },
    {
      name: "medications",
      label: "Uso de medicamentos",
      type: "checkbox-group",
      options: ["Analgésicos", "Anti-inflamatório", "Antibióticos", "Anti-hipertensivos", "Antidepressivos"]
    },
    { name: "medicationDosage", label: "Dosagem dos medicamentos", type: "text" },
    { name: "complementaryExams", label: "Exames complementares", type: "textarea" },
    { name: "inspection", label: "Inspeção (Marcha, cicatrizes, inflamações)", type: "textarea" },
    { name: "physicalExam", label: "Exame Físico (Força, ADM, função, testes neurodinâmicos)", type: "textarea" },
    { name: "diagnosis", label: "Diagnóstico Fisioterapêutico", type: "textarea" },
    {
      name: "treatmentGoals",
      label: "Objetivos do tratamento",
      type: "checkbox-group",
      options: [
        "Analgesia",
        "Acelerar cicatrização tecidual",
        "Restaurar mobilidade articular e tecidual",
        "Restaurar força e condicionamento muscular",
        "Melhora do equilíbrio e coordenação motora",
        "Minimizar doenças e lesões",
        "Retornar às atividades funcionais e esportivas",
        "Recuperação esportiva"
      ]
    },
    { name: "otherGoals", label: "Outros objetivos", type: "textarea" },
    {
      name: "treatmentPlan",
      label: "Plano Fisioterapêutico",
      type: "checkbox-group",
      options: [
        "Terapia manual ortopédica",
        "Cinesioterapia",
        "Eletroterapia",
        "ETCC (tDCS)",
        "Fotobiomodulação",
        "Drenagem linfática manual e pneumática",
        "Crioimersão"
      ]
    },
    { name: "otherConducts", label: "Demais condutas (parâmetros e dosagens)", type: "textarea" }
  ],
  pelvica: [
    { name: "doctorName", label: "Médico responsável", type: "text" },
    { name: "physioName", label: "Fisioterapeuta responsável", type: "text" },
    { name: "mainComplaint", label: "1. Queixa principal (O que te trouxe aqui hoje?)", type: "textarea" },
    { name: "urinaryLoss", label: "Perde urina?", type: "select", options: ["Não", "Sim"] },
    {
      name: "urinaryTriggers",
      label: "Quando perde urina?",
      type: "checkbox-group",
      options: ["Tossir/espirrar", "Urgência", "Atividade física", "Sem perceber"]
    },
    { name: "urinaryUrgency", label: "Urgência para urinar?", type: "select", options: ["Não", "Sim"] },
    { name: "urinaryFrequency", label: "Vai ao banheiro muitas vezes ao dia?", type: "select", options: ["Não", "Sim"] },
    { name: "nocturia", label: "Acorda à noite para urinar?", type: "select", options: ["Não", "1x", "2 ou mais"] },
    { name: "constipation", label: "Constipação?", type: "select", options: ["Não", "Sim"] },
    { name: "bowelStrain", label: "Esforço para evacuar?", type: "select", options: ["Não", "Sim"] },
    { name: "fecalIncontinence", label: "Perda de fezes ou gases?", type: "select", options: ["Não", "Sim"] },
    { name: "intercoursePain", label: "Dor na relação sexual?", type: "select", options: ["Não", "Sim"] },
    { name: "lubricationDifficulty", label: "Dificuldade de lubrificação?", type: "select", options: ["Não", "Sim"] },
    { name: "decreasedLibido", label: "Diminuição do desejo?", type: "select", options: ["Não", "Sim"] },
    { name: "erectileDysfunction", label: "Disfunção erétil (para homens)?", type: "select", options: ["Não", "Sim"] },
    { name: "prematureEjaculation", label: "Ejaculação precoce (para homens)?", type: "select", options: ["Não", "Sim"] },
    { name: "hasBeenPregnant", label: "Já esteve grávida?", type: "select", options: ["Não", "Sim"] },
    { name: "gestationsCount", label: "Número de gestações", type: "text" },
    { name: "birthType", label: "Tipo de parto", type: "select", options: ["Nenhum", "Normal", "Cesárea"] },
    { name: "perinealLaceration", label: "Teve laceração?", type: "select", options: ["Não", "Sim"] },
    { name: "episiotomy", label: "Episiotomia?", type: "select", options: ["Não", "Sim"] },
    { name: "menstruation", label: "Menstruação", type: "select", options: ["Regular", "Irregular", "Menopausa"] },
    { name: "contraceptiveUse", label: "Usa anticoncepcional?", type: "select", options: ["Não", "Sim"] },
    { name: "pelvicSurgery", label: "Já fez cirurgia pélvica?", type: "select", options: ["Não", "Sim"] },
    { name: "pelvicSurgeryDetails", label: "Se fez cirurgia pélvica, qual?", type: "text" },
    { name: "pelvicPain", label: "Sente dor na região pélvica?", type: "select", options: ["Não", "Sim"] },
    { name: "pelvicPainScale", label: "Intensidade da dor pélvica (0-10)", type: "scale", min: 0, max: 10 },
    { name: "pelvicPainLocation", label: "Local da dor pélvica", type: "text" },
    { name: "pelvicPainTriggers", label: "Quando a dor pélvica aparece?", type: "text" },
    { name: "waterIntake", label: "Consome água suficiente?", type: "select", options: ["Não", "Sim"] },
    { name: "physicalActivity", label: "Pratica atividade física?", type: "select", options: ["Não", "Sim"] },
    { name: "stressLevel", label: "Nível de estresse", type: "select", options: ["Baixo", "Moderado", "Alto"] },
    { name: "alertBleeding", label: "Sangramento fora do período?", type: "select", options: ["Não", "Sim"] },
    { name: "alertSuddenPain", label: "Dor intensa súbita?", type: "select", options: ["Não", "Sim"] },
    { name: "alertUtis", label: "Infecção urinária frequente?", type: "select", options: ["Não", "Sim"] },
    { name: "inspection", label: "Inspeção física pélvica", type: "select", options: ["Normal", "Alterada"] },
    { name: "muscleTone", label: "Tônus muscular", type: "select", options: ["Normal", "Hipotônico", "Hipertônico"] },
    { name: "oxfordScale", label: "Força muscular (Escala de Oxford)", type: "select", options: ["0", "1", "2", "3", "4", "5"] },
    { name: "coordination", label: "Coordenação", type: "select", options: ["Adequada", "Inadequada"] },
    { name: "palpationPain", label: "Dor à palpação?", type: "select", options: ["Não", "Sim"] },
    { name: "diagnosis", label: "Diagnóstico Fisioterapêutico Pélvico", type: "textarea" },
    { name: "treatmentConduct", label: "Conduta Fisioterapêutica", type: "textarea" },
    { name: "treatmentGoals", label: "Objetivo do Tratamento", type: "textarea" }
  ],
  osteopatia: [
    { name: "mainComplaint", label: "Queixa principal", type: "textarea" },
    { name: "structuralFindings", label: "Achados estruturais", type: "textarea" },
    { name: "osteopathicDiagnosis", label: "Diagnóstico osteopático", type: "textarea" },
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
    const firstVal = Array.isArray(values[0]) ? values[0].join(", ") : String(values[0]);
    return firstVal.slice(0, 160);
  }

  return record.notes || "Sem resumo disponível.";
}

export function getMedicalRecordFieldLabel(fieldName) {
  return fieldLabels[fieldName] || fieldName;
}

export function getMedicalRecordSections(record) {
  const dynamicFields = getMedicalRecordFieldsByType(record.type);
  const sections = dynamicFields
    .map((field) => {
      const rawValue = record.data?.[field.name];
      if (rawValue === undefined || rawValue === null || rawValue === "" || (Array.isArray(rawValue) && rawValue.length === 0)) {
        return null;
      }

      let formattedValue = rawValue;
      if (Array.isArray(rawValue)) {
        formattedValue = rawValue.map((item) => `• ${item}`).join("\n");
      } else if (field.type === "scale") {
        formattedValue = `${rawValue} / 10 (Escala Numérica de Dor)`;
      }

      return {
        title: field.label,
        value: String(formattedValue)
      };
    })
    .filter(Boolean);

  if (record.notes) {
    sections.push({
      title: "Observações gerais",
      value: record.notes
    });
  }

  return sections;
}
