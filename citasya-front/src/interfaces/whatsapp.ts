import { BaseEntity } from './common';

export interface WhatsAppWebhookResponse {
    id: string;
    message: string;
    receivedAt: string;
}

export interface WhatsAppWebhook extends BaseEntity {
    id: string;
    message: string;
    receivedAt: string;
}

export interface CreateWhatsAppWebhookRequest {
    message: string;
}

export interface UpdateWhatsAppWebhookRequest {
    message?: string;
}

export interface WhatsAppWebhookFilters {
    page?: number;
    limit?: number;
}
