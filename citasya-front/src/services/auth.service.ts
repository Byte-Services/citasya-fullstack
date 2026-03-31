/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseService } from './baseService';
import { LoginRequest, LoginResponse } from '@/interfaces/auth';

export class AuthService extends BaseService<any> {
  constructor() {
    super('auth');
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.service.post<LoginResponse>('/auth/login', data);
  }
}

export const authService = new AuthService();