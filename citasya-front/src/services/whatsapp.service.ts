import { WhatsAppWebhook } from '@/interfaces/whatsapp';
import { BaseService } from './baseService';

export class WhatsAppService extends BaseService<WhatsAppWebhook> {
  constructor() {
    super('whatsapp/webhook');
  }
}

export const whatsappService = new WhatsAppService();