import { Request, Response } from 'express';
import { ReportService } from './report.service.js';

export class ReportController {
    private reportService: ReportService;

    constructor() {
        this.reportService = new ReportService();
    }

    public getDashboardMetrics = async (req: Request, res: Response): Promise<void> => {
        try {
            const metrics = await this.reportService.getDashboardMetrics();
            res.status(200).json(metrics);
        } catch (error: any) {
            console.error("Error fetching dashboard metrics:", error);
            res.status(500).json({ message: "Error al obtener las métricas del dashboard.", error: error.message });
        }
    }
}