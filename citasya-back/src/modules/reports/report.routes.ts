import { Router } from 'express';
import { ReportController } from './report.controller.js';
import { authenticateJWT } from '../auth/auth.middleware.js';

const router = Router();
const reportController = new ReportController();

// Aplica el middleware globalmente a todas las rutas de reportes
router.use(authenticateJWT);

/**
 * @swagger
 * /admin/reports/dashboard:
 *   get:
 *     summary: Obtener métricas del dashboard
 *     description: Retorna las métricas importantes del dashboard comparando con periodos anteriores.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 citasHoy:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: integer
 *                     vsAyer:
 *                       type: integer
 *                 clientesNuevos:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: integer
 *                     vsAyer:
 *                       type: integer
 *                 ingresosDia:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: number
 *                     vsAyer:
 *                       type: integer
 *                 tasaAsistencia:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: integer
 *                     vsMesPasado:
 *                       type: integer
 *       500:
 *         description: Error en el servidor
 */
router.get('/dashboard', reportController.getDashboardMetrics);

export default router;