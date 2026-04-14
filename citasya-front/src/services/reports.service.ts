import { BaseService } from './baseService';
import { DashboardMetrics, Report } from '@/interfaces/report';

export class ReportService extends BaseService<Report> {
  constructor() {
    super('reports');
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    return this.service.get<DashboardMetrics>(`/${this.baseEndpoint}/dashboard`);
  }
}

export const reportService = new ReportService();
