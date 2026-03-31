import { BaseEntity } from './common';

export interface Specialty extends BaseEntity {
    name: string;
    description: string;
    center_id: string;
}

export interface CreateSpecialtyRequest {
    name: string;
    description: string;
    center_id: string;
}

export interface UpdateSpecialtyRequest {
    name?: string;
    description?: string;
    center_id?: string;
}

export interface SpecialtyFilters {
    page?: number;
    limit?: number;
}
