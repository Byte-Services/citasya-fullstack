
import { BaseEntity } from './common';

export interface ServiceResponse {
    name: string;
    description: string;
    minutes_duration: number;
    price: number;
    status: string;
    specialty_id: number;
}

export interface EventsInterface {
    title: string,
    description: string,
    startDate: string,
    endDate: string,
    location: string,
    eventType: string,
    visibility: string,
    createdById: string,
    isActive: boolean
}

export interface Service extends BaseEntity {
    name: string;
    description: string;
    minutes_duration: number;
    price: number;
    status: string;
    specialty_id: number;
}

export interface CreateServiceRequest {
    name: string;
    description: string;
    minutes_duration: number;
    price: number;
    status: string;
    specialty_id: number;
}

export interface UpdateServiceRequest {
    name?: string;
    description?: string;
    minutes_duration?: number;
    price?: number;
    status?: string;
    specialty_id?: number;
}

export interface ServiceFilters {
    page?: number;
    limit?: number;
}
