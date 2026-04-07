import {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  LogoutRequest,
} from '@/interfaces/auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'http://localhost:3000';

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorBody: unknown = undefined;
    try {
      const text = await response.text();
      errorBody = text ? JSON.parse(text) : undefined;
    } catch {
      // ignore JSON parse errors
    }

    throw new Error(
      (errorBody as { message?: string })?.message ||
        `HTTP error! status: ${response.status}`,
    );
  }

  return (await response.json()) as T;
}

export class AuthService {

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return parseResponse<LoginResponse>(response);
  }

  async refreshToken(token: string): Promise<RefreshTokenResponse> {
    const payload = { refreshToken: token };
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return parseResponse<RefreshTokenResponse>(response);
  }

  async logout(refreshToken?: string): Promise<void> {
    const payload: LogoutRequest | undefined = refreshToken
      ? { refreshToken }
      : undefined;
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload ? JSON.stringify(payload) : undefined,
    });

    if (!response.ok) {
      let errorBody: unknown = undefined;
      try {
        const text = await response.text();
        errorBody = text ? JSON.parse(text) : undefined;
      } catch {
        // ignore JSON parse errors
      }

      throw new Error(
        (errorBody as { message?: string })?.message ||
          `HTTP error! status: ${response.status}`,
      );
    }
  }
}

export const authService = new AuthService();