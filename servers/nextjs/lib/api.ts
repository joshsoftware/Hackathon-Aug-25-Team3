import { getAuthToken, handleAuthError } from "./auth";

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function fetchWithAuth(url: string, options: FetchOptions = {}) {
  const { skipAuth = false, headers = {}, ...rest } = options;

  const token = getAuthToken();
  const finalHeaders = new Headers(headers);

  if (!skipAuth && token) {
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  if (options.body && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(url, {
      ...rest,
      headers: finalHeaders,
    });

    if (!response.ok) {
      if (response.status === 401) {
        handleAuthError(response);
      }

      const error = await response.json().catch(() => ({}));
      throw { status: response.status, ...error };
    }

    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error");
  }
}

// Helper methods for common HTTP methods
export const api = {
  get: (url: string, options?: FetchOptions) =>
    fetchWithAuth(url, { ...options, method: "GET" }),

  post: (url: string, data?: any, options?: FetchOptions) =>
    fetchWithAuth(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: (url: string, data?: any, options?: FetchOptions) =>
    fetchWithAuth(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (url: string, options?: FetchOptions) =>
    fetchWithAuth(url, { ...options, method: "DELETE" }),
};
