import { Router } from 'express';
import { DashboardController } from './dashboard.controller.js';

const router = Router();
const dashboardController = new DashboardController();

router.get('/dashboard-stats', dashboardController.getDashboardStats);
router.get('/dashboard-appointments', dashboardController.getDashboardAppointments);
router.get('/dashboard-services', dashboardController.getServicesChartData);
router.get("/dashboard-revenue", dashboardController.getRevenueChartData);


export default router;