import { useEffect, useState } from "react";
import { AdminDashboardApp } from "./AdminDashboardApp";
import { PublicBookingPage } from "./pages/PublicBookingPage";
import { PublicLandingPage } from "./pages/PublicLandingPage";
import { getCurrentPathname, subscribeToNavigation } from "./lib/navigation";

export default function App() {
  const [pathname, setPathname] = useState(getCurrentPathname());

  useEffect(() => subscribeToNavigation(setPathname), []);

  if (pathname === "/admin") {
    return <AdminDashboardApp />;
  }

  if (pathname.startsWith("/booking/")) {
    const serviceId = pathname.split("/")[2];
    return <PublicBookingPage serviceId={serviceId} />;
  }

  return <PublicLandingPage />;
}
