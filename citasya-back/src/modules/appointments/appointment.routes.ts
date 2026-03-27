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

/**
 * @swagger
 * /admin/appointments/{id}:
 *   get:
 *     summary: Obtener una cita por ID
 *     description: Retorna los detalles de una cita específica
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *     responses:
 *       200:
 *         description: Detalles de la cita
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       404:
 *         description: Cita no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', appointmentsController.getAppointmentById);

/**
 * @swagger
 * /admin/appointments:
 *   post:
 *     summary: Crear una nueva cita
 *     description: Crea una cita en el sistema
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - hour
 *               - status
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-03-27"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-03-27"
 *               hour:
 *                 type: string
 *                 example: "14:30"
 *               status:
 *                 type: string
 *                 enum: [Pendiente, Confirmado, Cancelado, Concluida]
 *                 example: "Pendiente"
 *               service_id:
 *                 type: integer
 *                 example: 1
 *               client_id:
 *                 type: integer
 *                 example: 1
 *               worker_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Cita creada exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       500:
 *         description: Error del servidor
 */
router.post('/', appointmentsController.createAppointment);

/**
 * @swagger
 * /admin/appointments/{id}:
 *   put:
 *     summary: Actualizar una cita
 *     description: Actualiza los datos de una cita existente
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-03-28"
 *               end_date:
 *                 type: string
 *                 format: date
 *               hour:
 *                 type: string
 *                 example: "15:00"
 *               status:
 *                 type: string
 *                 enum: [Pendiente, Confirmado, Cancelado, Concluida]
 *                 example: "Confirmado"
 *               service_id:
 *                 type: integer
 *               client_id:
 *                 type: integer
 *               worker_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cita actualizada exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Cita no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', appointmentsController.updateAppointment);

/**
 * @swagger
 * /admin/appointments/{id}:
 *   delete:
 *     summary: Eliminar una cita
 *     description: Elimina una cita de la base de datos
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *     responses:
 *       200:
 *         description: Cita eliminada exitosamente
 *       404:
 *         description: Cita no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', appointmentsController.deleteAppointment);

export default router;
