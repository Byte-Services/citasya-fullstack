import { Client } from '@/interfaces/client';
import { BaseService } from './baseService';

export class ClientService extends BaseService<Client> {
  constructor() {
    super('clients');
  }
}

export const clientService = new ClientService();