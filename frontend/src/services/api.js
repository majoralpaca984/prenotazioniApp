import { getToken } from "../utils/auth";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function apiRequest(path, options = {}) {
  const { auth = false, headers, ...fetchOptions } = options;
  const token = auth ? getToken() : null;

  if (auth && !token) {
    throw new Error("Sessione scaduta. Accedi di nuovo.");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers: {
      ...(fetchOptions.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || `Richiesta non riuscita (${response.status})`);
  }

  return data;
}
