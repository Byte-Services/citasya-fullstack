
import { BaseEntity } from './common';


export interface Client extends BaseEntity {
    name: string;
    documentId: string;
    phone: string;
    notes: string;
    center_id: number;
}

export interface CreateClientRequest {
      name: string;
    documentId: string;
    phone: string;
    notes: string;
    center_id: number;
}

export interface UpdateClientRequest {
  name?: string;
    documentId?: string;
    phone?: string;
    notes?: string;
    center_id?: number;
}

export interface ClientFilters {
    page?: number;
    limit?: number;
}
