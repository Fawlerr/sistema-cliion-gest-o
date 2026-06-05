import { useEffect, useMemo, useState } from "react";
import { CalendarClock, CreditCard, LayoutDashboard, Menu, NotebookTabs, Package, Users, X } from "lucide-react";
import { useAuth } from "./contexts/AuthContext";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
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
    title: "Visão geral da clínica",
    descriptionText: "Acompanhe pacientes, faturamento, despesas e a agenda da semana em um único painel.",
    roles: [1]
  },
  {
    id: "agenda",
    label: "Agenda",
    description: "Semana operacional",
    icon: NotebookTabs,
    title: "Agenda semanal",
    descriptionText: "Visualize os atendimentos em grade semanal, acompanhe horários livres e encontre conflitos rapidamente.",
    roles: [1]
  },
  {
    id: "patients",
    label: "Pacientes",
    description: "Cadastro e contatos",
    icon: Users,
    title: "Cadastro de pacientes",
    descriptionText: "Gerencie pacientes em cards, com criação e edição por modal integradas ao banco.",
    roles: [1, 2]
  },
  {
    id: "appointments",
    label: "Agendamentos",
    description: "Criação e edição",
    icon: CalendarClock,
    title: "Gestão de agendamentos",
    descriptionText: "Crie e atualize atendimentos com paciente, serviço, profissional, data, hora e status.",
    roles: [1, 2]
  },
  {
    id: "services",
    label: "Serviços",
    description: "Catálogo e valores",
    icon: Package,
    title: "Catálogo de serviços",
    descriptionText: "Cadastre e edite serviços, mantendo duração, descrição e precificação sempre atualizadas.",
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

export function AdminDashboardApp({ pathname = "/admin" }) {
  const { currentUser, logout, hasRole } = useAuth();
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

  function handleSidebarChange(nextPage) {
    setActivePage(nextPage);
    setIsSidebarOpen(false);
    navigateTo(nextPage === getDefaultPage(currentUser.role) && nextPage === "dashboard" ? "/admin" : `/admin/${nextPage}`);
  }

  return (
    <div className="app-shell min-h-screen px-4 py-5 text-white md:px-6 lg:px-8">
      {/* Header com informações de bem-vindo */}
      <div className="mx-auto mb-6 max-w-[1680px] rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:p-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Olá, <span className="font-bold text-cyan-300">{currentUser?.name}</span>
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Cargo: <span className="font-semibold text-slate-200">{currentUser?.role === 1 ? "Administrador" : "Funcionário"}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {hasRole([1]) && (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
              >
                ⚙️ Painel de Administração
              </button>
            )}
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20"
            >
              🚪 Sair
            </button>
          </div>
        </div>
      </div>

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
          <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">Área interna</p>
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
            onLogout={logout}
            onOpenMenu={() => setIsSidebarOpen(true)}
          />
          <ActivePage patientId={safeActivePage === "patients" ? currentPatientId : null} />
        </main>
      </div>
    </div>
  );
}