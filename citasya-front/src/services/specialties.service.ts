import { Specialty } from '@/interfaces/specialty';
import { BaseService } from './baseService';

export class SpecialtyService extends BaseService<Specialty> {
  constructor() {
    super('specialties');
  }
}

export const specialtyService = new SpecialtyService();