export function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(Number(value || 0));
}

function normalizeDateInput(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" && value.includes("T")) {
    return new Date(value);
  }

  return new Date(`${value}T12:00:00`);
}

export function formatDate(value) {
  if (!value) {
    return "-";
  }

  const parsedDate = normalizeDateInput(value);

  if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium"
  }).format(parsedDate);
}

export function formatDateTime(dateValue, timeValue) {
  if (!dateValue) {
    return "-";
  }

  const time = timeValue ? String(timeValue).slice(0, 5) : "00:00";
  return `${formatDate(dateValue)} • ${time}`;
}

export function formatDateForInput(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string" && value.includes("T")) {
    return value.slice(0, 10);
  }

  return String(value).slice(0, 10);
}

export function calculateAge(value) {
  const parsedDate = normalizeDateInput(value);

  if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const today = new Date();
  let age = today.getFullYear() - parsedDate.getFullYear();
  const monthDiff = today.getMonth() - parsedDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsedDate.getDate())) {
    age -= 1;
  }

  return age >= 0 ? String(age) : "";
}

export function ageToBirthDate(ageValue) {
  if (ageValue === undefined || ageValue === null || ageValue === "") {
    return "";
  }

  const age = Number.parseInt(ageValue, 10);

  if (!Number.isInteger(age) || age < 0) {
    return "";
  }

  const today = new Date();
  return new Date(today.getFullYear() - age, 0, 1).toISOString().slice(0, 10);
}
