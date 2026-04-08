import { Worker } from '@/interfaces/workers';
import { BaseService } from './baseService';

export class WorkersService extends BaseService<Worker> {
  constructor() {
    super('workers');
  }
}

export const workersService = new WorkersService();
