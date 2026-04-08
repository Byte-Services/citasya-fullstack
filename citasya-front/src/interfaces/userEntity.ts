import { BaseEntity } from './common';

export interface UserResponse {
    name: string;
    email: string;
    phone?: string;
    role: string;
    is_active?: boolean;
    center_id?: number;
    status?: string;
}

export interface User extends BaseEntity {
    name: string;
    email: string;
    phone?: string;
    role: string;
    is_active?: boolean;
    center_id?: number;
    status?: string;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    phone?: string;
    password_hash: string;
    role: string;
    is_active?: boolean;
    center_id?: number;
    status?: string;
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    phone?: string;
    password_hash?: string;
    role?: string;
    is_active?: boolean;
    center_id?: number;
    status?: string;
}

export interface UserFilters {
    page?: number;
    limit?: number;
}
