import { BaseEntity } from './common';

export interface UserResponse {
    name: string;
    email: string;
    role: string;
    status: string;
}

export interface User extends BaseEntity {
    name: string;
    email: string;
    role: string;
    status: string;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    role: string;
    status: string;
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    role?: string;
    status?: string;
}

export interface UserFilters {
    page?: number;
    limit?: number;
}
