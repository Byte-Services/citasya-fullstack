import { Router } from 'express';
import { AppointmentsController } from './appointment.controller.js';

const router = Router();
const appointmentsController = new AppointmentsController();

/**
 * @swagger
 * /admin/appointments:
 *   get:
 *     summary: Obtener todas las citas
 *     description: Retorna una lista de todas las citas registradas
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: Lista de citas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', appointmentsController.getAllAppointments);

export default router;
