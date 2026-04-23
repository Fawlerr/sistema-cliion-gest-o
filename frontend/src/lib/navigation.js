const navigationEventName = "clinic:navigate";

export function normalizePathname(pathname) {
  const value = pathname || "/";
  return value.endsWith("/") && value !== "/" ? value.slice(0, -1) : value;
}

export function getCurrentPathname() {
  if (typeof window === "undefined") {
    return "/";
  }

  return normalizePathname(window.location.pathname);
}

export function navigateTo(pathname) {
  if (typeof window === "undefined") {
    return;
  }

  const normalized = normalizePathname(pathname);

  if (normalized === getCurrentPathname()) {
    return;
  }

  window.history.pushState({}, "", normalized);
  window.dispatchEvent(new Event(navigationEventName));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function subscribeToNavigation(listener) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleChange = () => listener(getCurrentPathname());
  window.addEventListener("popstate", handleChange);
  window.addEventListener(navigationEventName, handleChange);

  return () => {
    window.removeEventListener("popstate", handleChange);
    window.removeEventListener(navigationEventName, handleChange);
  };
}
