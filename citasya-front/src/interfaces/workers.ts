
import { BaseEntity } from './common';

export interface WorkersResponse {
    name: string;
    documentId: string;
    phone: string;
    email: string;
    schedule: object;
    status: string;
    notas: string;
    center_id: number;
}

export interface WorkersInterface {
    name: string;
    documentId: string;
    phone: string;
    email: string;
    schedule: object;
    status: string;
    notas: string;
    center_id: number;
}

export interface Worker extends BaseEntity {
    name: string;
    documentId: string;
    phone: string;
    email: string;
    schedule: object;
    status: string;
    notas: string;
    center_id: number;
}

export interface CreateWorkersRequest {
    name: string;
    documentId: string;
    phone: string;
    email: string;
    schedule: object;
    status: string;
    notas: string;
    center_id: number;
}

export interface UpdateWorkersRequest {
    name?: string;
    documentId?: string;
    phone?: string;
    email?: string;
    schedule?: object;
    status?: string;
    notas?: string;
    center_id?: number;
}

export interface WorkersFilters {
    page?: number;
    limit?: number;
}
