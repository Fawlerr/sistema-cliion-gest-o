import { clearAuthToken, getAuthToken } from "./auth";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

function buildUrl(path, query = {}) {
  const url = API_BASE.startsWith("http")
    ? new URL(`${API_BASE}${path}`)
    : new URL(`${API_BASE}${path}`, window.location.origin);

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

export async function apiRequest(path, { method = "GET", body, query, signal } = {}) {
  const token = getAuthToken();
  const headers = {};

  if (body) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    signal,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthToken();
    }

    const message = payload?.error?.message || `Falha na requisicao com status ${response.status}.`;
    throw new Error(message);
  }

  return payload;
}

export async function getResource(path, options) {
  const payload = await apiRequest(path, options);
  return payload.data;
}

export async function getCollection(path, options) {
  const payload = await apiRequest(path, options);
  return {
    data: payload.data || [],
    meta: payload.meta || { count: 0 }
  };
}
