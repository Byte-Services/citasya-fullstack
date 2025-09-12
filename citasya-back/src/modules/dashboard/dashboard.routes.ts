import { Router } from 'express';
import { DashboardController } from './dashboard.controller.js';

const router = Router();
const dashboardController = new DashboardController();

// Ruta para obtener las estadísticas del dashboard (tarjetas)
router.get('/dashboard-stats', dashboardController.getDashboardStats);

// Ruta para obtener la lista de citas (para el componente AppointmentsList)
router.get('/dashboard-appointments', dashboardController.getDashboardAppointments);

// Ruta para obtener los datos del gráfico de servicios
router.get('/dashboard-services', dashboardController.getServicesChartData);

export default router;