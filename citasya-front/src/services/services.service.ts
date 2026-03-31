import { Service } from '@/interfaces/service';
import { BaseService } from './baseService';

export class ServiceService extends BaseService<Service> {
  constructor() {
    super('services');
  }
}

export const serviceService = new ServiceService();