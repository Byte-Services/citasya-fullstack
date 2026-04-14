import { BaseEntity } from './common';
import { BaseFilters } from '@/services/baseService';

export interface DashboardMetric {
  value: number;
  vsAyer?: number;
  vsMesPasado?: number;
}

export interface DashboardMetrics {
  citasHoy: DashboardMetric;
  clientesNuevos: DashboardMetric;
  ingresosDia: DashboardMetric;
  tasaAsistencia: DashboardMetric;
}

export interface Report extends BaseEntity {
  title: string;
  description: string;
  type: string;
  createdBy: number;
  createdAt: string;
  data: Date; // Ajusta el tipo según la estructura de los datos del reporte
}

export interface ReportFilters extends BaseFilters {
  type?: string;
  createdBy?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateReportRequest {
  title: string;
  description: string;
  type: string;
  data: Date; // Ajusta el tipo según la estructura de los datos del reporte
}

export interface UpdateReportRequest {
  title?: string;
  description?: string;
  type?: string;
  data?: Date; // Ajusta el tipo según la estructura de los datos del reporte
}
