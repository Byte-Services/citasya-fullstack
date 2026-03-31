// Interfaces de autenticación

import { User } from "./user";


export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: {
    id: number;
    name: string;
    email: string;
    role?: string;
    // Otros campos según la respuesta de tu backend
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
} 