
import { Appointment } from '@/interfaces/appointment';
import { BaseService } from './baseService';

export class AppointmentService extends BaseService<Appointment> {
  constructor() {
    super('appointments');
  }
}

export const appointmentService = new AppointmentService();

