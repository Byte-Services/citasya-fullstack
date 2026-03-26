import { apiService } from './api';
import { 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenResponse
} from '../interfaces';

export class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiService.post<LoginResponse>('/auth/login', credentials);
  }

  async logout(): Promise<void> {
    try {
      await apiService.post<void>('/auth/logout', {});
    } catch (error) {
      console.warn('Logout API failed (ignored):', error);
    }
  }

  async refreshToken(token: string): Promise<RefreshTokenResponse> {
    return apiService.post<RefreshTokenResponse>('/auth/refresh', { token });
  }

  async getProfile(): Promise<unknown> {
    return apiService.get('/auth/profile');
  }
}

export const authService = new AuthService(); 