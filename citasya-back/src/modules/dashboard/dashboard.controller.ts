import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service.js';

const dashboardService = new DashboardService();

export class DashboardController {
    /**
     * Obtiene estadísticas generales del dashboard.
     * @return JSON con las estadísticas o mensaje de error.
     */
    async getDashboardStats(req: Request, res: Response): Promise<Response> {
        try {
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({ message: 'Las fechas de inicio y fin son requeridas.' });
            }

            const data = await dashboardService.getDashboardStats(startDate as string, endDate as string);
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ message: 'Error interno del servidor al obtener estadísticas.' });
        }
    }

    /**
     * Obtiene la lista de citas del dashboard en un rango de fechas.
     * @return JSON con las citas o mensaje de error.
     */
    async getDashboardAppointments(req: Request, res: Response): Promise<Response> {
        try {
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({ message: 'Las fechas de inicio y fin son requeridas.' });
            }

            const appointments = await dashboardService.getAppointmentsByDateRange(startDate as string, endDate as string);
            return res.status(200).json(appointments);
        } catch (error) {
            return res.status(500).json({ message: 'Error interno del servidor al obtener citas.' });
        }
    }

    /**
     * Obtiene los datos del gráfico de servicios del dashboard.
     * @return JSON con los datos del gráfico o mensaje de error.
     */
    async getServicesChartData(req: Request, res: Response): Promise<Response> {
        try {
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({ message: 'Las fechas de inicio y fin son requeridas.' });
            }

            const chartData = await dashboardService.getServicesChartData(startDate as string, endDate as string);
            return res.status(200).json(chartData);
        } catch (error) {
            return res.status(500).json({ message: 'Error interno del servidor al obtener datos del gráfico.' });
        }
    }

    async getRevenueChartData(req: Request, res: Response): Promise<Response> {
        try {
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
            return res.status(400).json({ message: "Fechas requeridas" });
            }

            const data = await dashboardService.getRevenueByDateRange(
            startDate as string,
            endDate as string
            );

            return res.status(200).json(data);
        } catch (error) {
            console.error("Error en getRevenueChartData:", error);
            return res.status(500).json({ message: "Error interno al obtener ingresos." });
        }
    }

}