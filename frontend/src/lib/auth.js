const authTokenStorageKey = "clinic-dashboard-demo.auth-token";

export function getAuthToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(authTokenStorageKey) || "";
}

export function setAuthToken(token) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(authTokenStorageKey, token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(authTokenStorageKey);
}

export function hasAuthToken() {
  return Boolean(getAuthToken());
}
