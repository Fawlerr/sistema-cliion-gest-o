const patients = [
  { id: "PT-1001", name: "Marina Costa", age: 34, phone: "(11) 99812-1100", email: "marina.costa@example.com", condition: "Postural rehabilitation", plan: "Premium", status: "Active", lastVisit: "2026-03-30", nextVisit: "2026-04-02" },
  { id: "PT-1002", name: "Rafael Gomes", age: 42, phone: "(11) 99771-2233", email: "rafael.gomes@example.com", condition: "Knee recovery", plan: "Standard", status: "Active", lastVisit: "2026-03-29", nextVisit: "2026-04-01" },
  { id: "PT-1003", name: "Helena Duarte", age: 28, phone: "(21) 98811-5532", email: "helena.duarte@example.com", condition: "Sports injury", plan: "Premium", status: "New", lastVisit: "2026-03-28", nextVisit: "2026-04-03" },
  { id: "PT-1004", name: "Carlos Mendes", age: 51, phone: "(31) 99145-1108", email: "carlos.mendes@example.com", condition: "Lumbar pain", plan: "Standard", status: "Pending", lastVisit: "2026-03-25", nextVisit: "2026-04-05" },
  { id: "PT-1005", name: "Patricia Nunes", age: 39, phone: "(41) 99211-3378", email: "patricia.nunes@example.com", condition: "Pilates rehab", plan: "Premium", status: "Active", lastVisit: "2026-03-27", nextVisit: "2026-04-01" },
  { id: "PT-1006", name: "Bruno Teixeira", age: 46, phone: "(51) 99790-4401", email: "bruno.teixeira@example.com", condition: "Shoulder mobility", plan: "Standard", status: "Active", lastVisit: "2026-03-26", nextVisit: "2026-04-04" },
  { id: "PT-1007", name: "Aline Ferreira", age: 31, phone: "(61) 99871-5502", email: "aline.ferreira@example.com", condition: "Post-op rehab", plan: "Premium", status: "Active", lastVisit: "2026-03-30", nextVisit: "2026-04-02" },
  { id: "PT-1008", name: "Joao Ribeiro", age: 57, phone: "(71) 99112-9033", email: "joao.ribeiro@example.com", condition: "Chronic pain", plan: "Basic", status: "Pending", lastVisit: "2026-03-20", nextVisit: "2026-04-07" },
  { id: "PT-1009", name: "Fernanda Lima", age: 29, phone: "(81) 99650-8820", email: "fernanda.lima@example.com", condition: "Neck therapy", plan: "Standard", status: "New", lastVisit: "2026-03-24", nextVisit: "2026-04-06" },
  { id: "PT-1010", name: "Eduardo Martins", age: 48, phone: "(85) 99862-1214", email: "eduardo.martins@example.com", condition: "Neurological rehab", plan: "Premium", status: "Active", lastVisit: "2026-03-30", nextVisit: "2026-04-01" }
];

const appointments = [
  { id: "AP-3001", patientName: "Marina Costa", date: "2026-03-31 08:30", service: "Manual Therapy", therapist: "Dr. Camila", status: "confirmed" },
  { id: "AP-3002", patientName: "Rafael Gomes", date: "2026-03-31 09:15", service: "Rehabilitation Training", therapist: "Dr. Victor", status: "confirmed" },
  { id: "AP-3003", patientName: "Helena Duarte", date: "2026-03-31 10:00", service: "Sports Recovery", therapist: "Dr. Ana", status: "pending" },
  { id: "AP-3004", patientName: "Carlos Mendes", date: "2026-03-31 11:30", service: "Spine Assessment", therapist: "Dr. Camila", status: "canceled" },
  { id: "AP-3005", patientName: "Patricia Nunes", date: "2026-03-31 13:00", service: "Pilates Session", therapist: "Dr. Julia", status: "confirmed" },
  { id: "AP-3006", patientName: "Bruno Teixeira", date: "2026-03-31 14:15", service: "Mobility Session", therapist: "Dr. Victor", status: "pending" },
  { id: "AP-3007", patientName: "Aline Ferreira", date: "2026-03-31 15:00", service: "Post-op Rehab", therapist: "Dr. Julia", status: "confirmed" },
  { id: "AP-3008", patientName: "Joao Ribeiro", date: "2026-03-31 16:40", service: "Pain Management", therapist: "Dr. Camila", status: "confirmed" }
];

const appointmentsTrend = [
  { day: "Mon", appointments: 18 },
  { day: "Tue", appointments: 24 },
  { day: "Wed", appointments: 22 },
  { day: "Thu", appointments: 27 },
  { day: "Fri", appointments: 31 },
  { day: "Sat", appointments: 16 },
  { day: "Sun", appointments: 8 }
];

const revenueMonthly = [
  { month: "Jan", revenue: 18200, expenses: 9500 },
  { month: "Feb", revenue: 19600, expenses: 10150 },
  { month: "Mar", revenue: 22800, expenses: 10950 },
  { month: "Apr", revenue: 24100, expenses: 11100 },
  { month: "May", revenue: 25500, expenses: 11750 },
  { month: "Jun", revenue: 26900, expenses: 12300 }
];

const servicesDistribution = [
  { name: "Manual Therapy", value: 28 },
  { name: "Pilates Rehab", value: 22 },
  { name: "Sports Recovery", value: 18 },
  { name: "Post-op Rehab", value: 20 },
  { name: "Neurological Rehab", value: 12 }
];

let liveStats = {
  totalPatients: 284,
  appointmentsToday: 32,
  monthlyRevenue: 26900,
  pendingPayments: 4200
};

function vary(number, delta) {
  return number + Math.floor(Math.random() * delta * 2 + 1) - delta;
}

export function tickLiveStats() {
  liveStats = {
    totalPatients: vary(284, 2),
    appointmentsToday: vary(32, 3),
    monthlyRevenue: vary(26900, 900),
    pendingPayments: vary(4200, 350)
  };
}

export function getPatients() {
  return patients;
}

export function updatePatient(patientId, changes) {
  const patient = patients.find((item) => item.id === patientId);

  if (!patient) {
    return null;
  }

  Object.assign(patient, changes);

  return patient;
}

export function getAppointments() {
  return appointments;
}

export function getDashboard() {
  const totalExpenses = revenueMonthly.reduce((sum, item) => sum + item.expenses, 0);
  const totalRevenue = revenueMonthly.reduce((sum, item) => sum + item.revenue, 0);

  return {
    kpis: [
      { id: "patients", title: "Total Patients", value: liveStats.totalPatients, change: "+12.4%", tone: "cyan" },
      { id: "appointments", title: "Appointments Today", value: liveStats.appointmentsToday, change: "+6 today", tone: "violet" },
      { id: "revenue", title: "Monthly Revenue", value: liveStats.monthlyRevenue, prefix: "$", change: "+8.1%", tone: "emerald" },
      { id: "payments", title: "Pending Payments", value: liveStats.pendingPayments, prefix: "$", change: "14 invoices", tone: "amber" }
    ],
    charts: {
      appointmentsTrend,
      revenueMonthly,
      servicesDistribution
    },
    recentAppointments: appointments,
    financial: {
      monthlyOverview: revenueMonthly,
      totalRevenue,
      totalExpenses,
      profit: totalRevenue - totalExpenses,
      margin: `${Math.round(((totalRevenue - totalExpenses) / totalRevenue) * 100)}%`
    }
  };
}
