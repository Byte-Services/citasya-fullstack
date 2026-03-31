// Interfaces de usuario

import { BaseEntity } from "./common";

export type UserRole = 'Admin' | 'ADMIN';

export interface User extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  is_active: boolean;
  role: UserRole;
  center_id: number;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  is_active: boolean;
  role: UserRole;
  center_id: number;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  password_hash?: string;
  is_active?: boolean;
  role?: UserRole;
  center_id?: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  page?: number;
  limit?: number;
}