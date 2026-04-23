import { useMemo, useState } from "react";
import { CalendarClock, CreditCard, LayoutDashboard, NotebookTabs, Package, Users } from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
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
    descriptionText: "Acompanhe pacientes, faturamento, despesas e a agenda da semana em um unico painel."
  },
  {
    id: "agenda",
    label: "Agenda",
    description: "Semana operacional",
    icon: NotebookTabs,
    title: "Agenda semanal",
    descriptionText: "Visualize os atendimentos em grade semanal, acompanhe horarios livres e encontre conflitos rapidamente."
  },
  {
    id: "patients",
    label: "Pacientes",
    description: "Cadastro e contatos",
    icon: Users,
    title: "Cadastro de pacientes",
    descriptionText: "Gerencie pacientes em cards, com criacao e edicao por modal integradas ao banco."
  },
  {
    id: "appointments",
    label: "Agendamentos",
    description: "Criacao e edicao",
    icon: CalendarClock,
    title: "Gestao de agendamentos",
    descriptionText: "Crie e atualize atendimentos com paciente, servico, profissional, data, hora e status."
  },
  {
    id: "services",
    label: "Servicos",
    description: "Catalogo e valores",
    icon: Package,
    title: "Catalogo de servicos",
    descriptionText: "Cadastre e edite servicos, mantendo duracao, descricao e precificacao sempre atualizadas."
  },
  {
    id: "billing",
    label: "Faturamento",
    description: "Pagamentos e despesas",
    icon: CreditCard,
    title: "Faturamento consolidado",
    descriptionText: "Veja pagamentos e despesas na mesma tela e lance novas entradas sem sair do fluxo."
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

export function AdminDashboardApp() {
  const [activePage, setActivePage] = useState("dashboard");
  const activeItem = useMemo(
    () => navigation.find((item) => item.id === activePage) || navigation[0],
    [activePage]
  );
  const ActivePage = pageMap[activePage] || DashboardPage;

  return (
    <div className="app-shell min-h-screen px-4 py-5 text-white md:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1680px] gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <Sidebar items={navigation} activePage={activePage} onChange={setActivePage} />

        <main className="min-w-0">
          <Topbar title={activeItem.title} description={activeItem.descriptionText} />
          <ActivePage />
        </main>
      </div>
    </div>
  );
}
