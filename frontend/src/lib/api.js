const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function buildUrl(path, query = {}) {
  const url = new URL(`${API_BASE}${path}`);

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

export async function apiRequest(path, { method = "GET", body, query, signal } = {}) {
  const response = await fetch(buildUrl(path, query), {
    method,
    signal,
    headers: {
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
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
