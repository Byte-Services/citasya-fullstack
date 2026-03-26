// Interfaces de usuario

import { BaseEntity } from "./common";


export type UserRole = 'ADMIN' | 'COORDINATOR' | 'SUPERVISOR';

export interface User extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  passwordHash: string;
  isActive: boolean;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  isActive: boolean;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  isActive?: boolean;
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