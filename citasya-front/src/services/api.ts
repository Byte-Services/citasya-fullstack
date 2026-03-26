import { useAuthStore } from "@/store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const { token } = useAuthStore.getState();

    const headers: Record<string, string> = {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...((options.headers as Record<string, string>) || {}),
    };
    // No establecer Content-Type para FormData, el navegador lo hace automáticamente
    if (options.body && !(typeof FormData !== 'undefined' && options.body instanceof FormData)) {
      if (!('Content-Type' in headers)) {
        headers['Content-Type'] = 'application/json';
      }
    }
    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      if (response.status === 401) {
        // Token expirado, intentar refresh
        try {
          
          const refreshAuthToken = useAuthStore.getState().refreshAuthToken;
          if (refreshAuthToken) {
            await refreshAuthToken();
            // Reintentar la petición con el nuevo token
            const newToken = useAuthStore.getState().token;
            if (newToken) {
              config.headers = {
                ...config.headers,
                Authorization: `Bearer ${newToken}`,
              };
              const retryResponse = await fetch(
                `${API_BASE_URL}${endpoint}`,
                config
              );
              if (!retryResponse.ok) {
                let errorBody: unknown = undefined;
                try {
                  const text = await retryResponse.text();
                  errorBody = text ? JSON.parse(text) : undefined;
                } catch {
                  // ignore JSON parse errors
                }
                const err: Error & { status?: number; body?: unknown } = new Error(
                  (errorBody as { message?: string })?.message || `HTTP error! status: ${retryResponse.status}`
                );
                err.status = retryResponse.status;
                err.body = errorBody;
                throw err;
              }
              return await retryResponse.json();
            }
          }
        } catch {
          // Si el refresh falla, hacer logout
          await useAuthStore.getState().logout();
          throw new Error("Sesión expirada");
        }
      }
      // Manejo de 403 Forbidden: token inválido o sin permisos
      if (response.status === 403) {
        // Limpiar token y redirigir al login
        const logout = useAuthStore.getState().logout;
        if (logout) logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        // También lanzar error para que la app lo sepa
        const err: Error & { status?: number } = new Error('Forbidden resource, redirecting to login');
        err.status = 403;
        throw err;
      }

      if (!response.ok) {
        let errorBody: unknown = undefined;
        try {
          const text = await response.text();
          errorBody = text ? JSON.parse(text) : undefined;
        } catch {
          // ignore JSON parse errors
        }
        const err: Error & { status?: number; body?: unknown } = new Error((errorBody as { message?: string })?.message || `HTTP error! status: ${response.status}`);
        err.status = response.status;
        err.body = errorBody;
        throw err;
      }

      // Parse response according to Content-Type to support CSV/text downloads
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json") || contentType.includes("application/problem+json")) {
        return await response.json();
      }

      // For CSV or other text-based responses, return text
      if (contentType.startsWith("text/") || contentType.includes("csv") || contentType.includes("octet-stream")) {
        return (await response.text()) as unknown as T;
      }

      // Fallback: try JSON, otherwise return text
      try {
        return await response.json();
      } catch {
        return (await response.text()) as unknown as T;
      }
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Métodos HTTP
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    return this.request<T>(endpoint, {
      method: "POST",
      body: isFormData ? data : data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    return this.request<T>(endpoint, {
      method: "PUT",
      body: isFormData ? data : data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: isFormData ? data : data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }
}

export const apiService = new ApiService();
