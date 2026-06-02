import { useEffect, useMemo, useState } from "react";
import { CalendarClock, CreditCard, LayoutDashboard, Menu, NotebookTabs, Package, Users, X } from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { clearAuthToken } from "./lib/auth";
import { navigateTo } from "./lib/navigation";
import { AgendaPage } from "./pages/AgendaPage";
import { AppointmentsPage } from "./pages/AppointmentsPage";
import { BillingPage } from "./pages/BillingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PatientsPage } from "./pages/PatientsPage";
import { ServicesPage } from "./pages/ServicesPage";

const navigation = [
  {
    id: "dashboard",
    label: "Painel",
    description: "KPIs, receita e agenda",
    icon: LayoutDashboard,
    title: "Visao geral da clinica",
    descriptionText: "Acompanhe pacientes, faturamento, despesas e a agenda da semana em um unico painel.",
    roles: [1]
  },
  {
    id: "agenda",
    label: "Agenda",
    description: "Semana operacional",
    icon: NotebookTabs,
    title: "Agenda semanal",
    descriptionText: "Visualize os atendimentos em grade semanal, acompanhe horarios livres e encontre conflitos rapidamente.",
    roles: [1]
  },
  {
    id: "patients",
    label: "Pacientes",
    description: "Cadastro e contatos",
    icon: Users,
    title: "Cadastro de pacientes",
    descriptionText: "Gerencie pacientes em cards, com criacao e edicao por modal integradas ao banco.",
    roles: [1, 2]
  },
  {
    id: "appointments",
    label: "Agendamentos",
    description: "Criacao e edicao",
    icon: CalendarClock,
    title: "Gestao de agendamentos",
    descriptionText: "Crie e atualize atendimentos com paciente, servico, profissional, data, hora e status.",
    roles: [1, 2]
  },
  {
    id: "services",
    label: "Servicos",
    description: "Catalogo e valores",
    icon: Package,
    title: "Catalogo de servicos",
    descriptionText: "Cadastre e edite servicos, mantendo duracao, descricao e precificacao sempre atualizadas.",
    roles: [1]
  },
  {
    id: "billing",
    label: "Faturamento",
    description: "Pagamentos e despesas",
    icon: CreditCard,
    title: "Faturamento consolidado",
    descriptionText: "Veja pagamentos e despesas na mesma tela e lance novas entradas sem sair do fluxo.",
    roles: [1]
  }
];

const pageMap = {
  dashboard: DashboardPage,
  agenda: AgendaPage,
  patients: PatientsPage,
  appointments: AppointmentsPage,
  services: ServicesPage,
  billing: BillingPage
};

function getDefaultPage(role) {
  return role === 1 ? "dashboard" : "patients";
}

function getPageFromPathname(pathname, role) {
  if (!pathname || pathname === "/admin") {
    return getDefaultPage(role);
  }

  const segments = pathname.split("/").filter(Boolean);
  return segments[1] || getDefaultPage(role);
}

function getPatientIdFromPathname(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[1] !== "patients") {
    return null;
  }

  return segments[2] || null;
}

export function AdminDashboardApp({ currentUser, pathname = "/admin" }) {
  const [activePage, setActivePage] = useState(getPageFromPathname(pathname, currentUser.role));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const allowedNavigation = useMemo(
    () => navigation.filter((item) => item.roles.includes(currentUser.role)),
    [currentUser.role]
  );
  const currentPatientId = getPatientIdFromPathname(pathname);

  useEffect(() => {
    setActivePage(getPageFromPathname(pathname, currentUser.role));
    setIsSidebarOpen(false);
  }, [currentUser.role, pathname]);

  useEffect(() => {
    if (!allowedNavigation.some((item) => item.id === activePage) && allowedNavigation[0]) {
      setActivePage(allowedNavigation[0].id);
      navigateTo(`/admin/${allowedNavigation[0].id}`);
    }
  }, [activePage, allowedNavigation]);

  const activeItem = useMemo(
    () => allowedNavigation.find((item) => item.id === activePage) || allowedNavigation[0],
    [activePage, allowedNavigation]
  );
  const safeActivePage = activeItem?.id || getDefaultPage(currentUser.role);
  const ActivePage = pageMap[safeActivePage] || DashboardPage;

  function handleLogout() {
    clearAuthToken();
    navigateTo("/login");
  }

  function handleSidebarChange(nextPage) {
    setActivePage(nextPage);
    setIsSidebarOpen(false);
    navigateTo(nextPage === getDefaultPage(currentUser.role) && nextPage === "dashboard" ? "/admin" : `/admin/${nextPage}`);
  }

  return (
    <div className="app-shell min-h-screen px-4 py-5 text-white md:px-6 lg:px-8">
      <div className="mx-auto mb-4 flex max-w-[1680px] items-center justify-between gap-3 xl:hidden">
        <button
          type="button"
          onClick={() => setIsSidebarOpen((current) => !current)}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          Menu
        </button>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">Area interna</p>
          <p className="text-sm font-semibold text-white">{currentUser.name}</p>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1680px] gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <Sidebar
          items={allowedNavigation}
          activePage={safeActivePage}
          onChange={handleSidebarChange}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="min-w-0">
          <Topbar
            title={activeItem.title}
            description={activeItem.descriptionText}
            user={currentUser}
            onLogout={handleLogout}
            onOpenMenu={() => setIsSidebarOpen(true)}
          />
          <ActivePage patientId={safeActivePage === "patients" ? currentPatientId : null} />
        </main>
      </div>
    </div>
  );
}
