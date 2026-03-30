
import { Client } from './client';
import { BaseEntity } from './common';
import { Service } from './service';
import { Worker } from './workers';

export interface AppointmentResponse {
    date:string,
    end_date: string,
    hour: string,
    status: string,
    service_id: number,
    client_id: number,
    worker_id: number,
    id: number
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

export interface Appointment extends BaseEntity {
    date: string;
    end_date: string;
    hour: string;
    status: string;
    service_id: number;
    service: Service;
    client_id: number;
    client: Client;
    worker_id: number;
    worker: Worker;
}

export interface CreateAppointmentRequest {
    date: string,
    end_date: string,
    hour: string,
    status: string,
    service_id: number,
    client_id: number,
    worker_id: number
}

export interface UpdateAppointmentRequest {
    date?: string,
    end_date?: string,
    hour?: string,
    status?: string,
    service_id?: number,
    client_id?: number,
    worker_id?: number
}

export interface AppointmentFilters {
    page?: number;
    limit?: number;
}
