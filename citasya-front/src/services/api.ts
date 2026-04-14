import { useAuthStore } from "@/store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:3000";

class ApiService {
  private async handleUnauthorized(message: string): Promise<never> {
    await useAuthStore.getState().logout();
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    const err: Error & { status?: number } = new Error(message);
    err.status = 401;
    throw err;
  }

  private async parseSuccessResponse<T>(response: Response): Promise<T> {
    if (response.status === 204 || response.status === 205) {
      return undefined as T;
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength === "0") {
      return undefined as T;
    }

    const contentType = response.headers.get("content-type") || "";

    if (
      contentType.includes("application/json") ||
      contentType.includes("application/problem+json")
    ) {
      return await response.json();
    }

    if (
      contentType.startsWith("text/") ||
      contentType.includes("csv") ||
      contentType.includes("octet-stream")
    ) {
      return (await response.text()) as unknown as T;
    }

    const raw = await response.text();
    if (!raw) {
      return undefined as T;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

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
        return this.handleUnauthorized("Sesion expirada");
      }
      // Manejo de 403 Forbidden: token inválido o sin permisos
      if (response.status === 403) {
        return this.handleUnauthorized("Acceso no autorizado");
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

      return await this.parseSuccessResponse<T>(response);
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
