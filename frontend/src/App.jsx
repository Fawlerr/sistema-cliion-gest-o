import { useEffect, useState } from "react";
import { AdminDashboardApp } from "./AdminDashboardApp";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { PublicAppointmentLinkPage } from "./pages/PublicAppointmentLinkPage";
import { PublicBookingPage } from "./pages/PublicBookingPage";
import { PublicLandingPage } from "./pages/PublicLandingPage";
import { getCurrentPathname, subscribeToNavigation } from "./lib/navigation";

export default function App() {
  const [pathname, setPathname] = useState(getCurrentPathname());

  useEffect(() => subscribeToNavigation(setPathname), []);

  if (pathname === "/login") {
    return <LoginPage />;
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return (
      <ProtectedRoute roles={[1, 2]}>
        {({ user }) => <AdminDashboardApp currentUser={user} pathname={pathname} />}
      </ProtectedRoute>
    );
  }

  if (pathname.startsWith("/booking/")) {
    const serviceId = pathname.split("/")[2];
    return <PublicBookingPage serviceId={serviceId} />;
  }

  if (pathname.startsWith("/agendar/")) {
    const token = pathname.split("/")[2];
    return <PublicAppointmentLinkPage token={token} />;
  }

  return <PublicLandingPage />;
}
