
import { BaseEntity } from './common';

export interface WorkersResponse {
    name: string;
    documentId?: string | null;
    phone?: string | null;
    email?: string | null;
    schedule?: Record<string, unknown> | null;
    status: string;
    notas?: string | null;
    center_id?: number | null;
}

export interface WorkersInterface {
    name: string;
    documentId?: string | null;
    phone?: string | null;
    email?: string | null;
    schedule?: Record<string, unknown> | null;
    status: string;
    notas?: string | null;
    center_id?: number | null;
}

export interface Worker extends BaseEntity {
    name: string;
    documentId?: string | null;
    phone?: string | null;
    email?: string | null;
    schedule?: Record<string, unknown> | null;
    status: string;
    notas?: string | null;
    center_id?: number | null;
}

export interface CreateWorkersRequest {
    name: string;
    documentId?: string | null;
    phone?: string | null;
    email?: string | null;
    schedule?: Record<string, unknown> | null;
    status: string;
    notas?: string | null;
    center_id?: number | null;
}

export interface UpdateWorkersRequest {
    name?: string;
    documentId?: string | null;
    phone?: string | null;
    email?: string | null;
    schedule?: Record<string, unknown> | null;
    status?: string;
    notas?: string | null;
    center_id?: number | null;
}

export interface WorkersFilters {
    page?: number;
    limit?: number;
}
