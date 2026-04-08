import { Router } from 'express';
import { WorkerController } from './worker.controller.js';

const router = Router();
const workerController = new WorkerController();

/**
 * @swagger
 * /api/workers:
 *   get:
 *     summary: Obtener todos los trabajadores
 *     tags: [Workers]
 *     responses:
 *       200:
 *         description: Lista de trabajadores obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Worker'
 *       500:
 *         description: Error en el servidor
 */
router.get('/', workerController.getAllWorkers);

/**
 * @swagger
 * /api/workers/{id}:
 *   get:
 *     summary: Obtener un trabajador por ID
 *     tags: [Workers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del trabajador
 *     responses:
 *       200:
 *         description: Trabajador encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Worker'
 *       404:
 *         description: Trabajador no encontrado
 *       500:
 *         description: Error en el servidor
 */
router.get('/:id', workerController.getWorkerById);

/**
 * @swagger
 * /api/workers:
 *   post:
 *     summary: Crear un nuevo trabajador
 *     tags: [Workers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkerInput'
 *     responses:
 *       201:
 *         description: Trabajador creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Worker'
 *       400:
 *         description: Datos de entrada inválidos
 *       500:
 *         description: Error en el servidor
 */
router.post('/', workerController.createWorker);

/**
 * @swagger
 * /api/workers/{id}:
 *   put:
 *     summary: Actualizar un trabajador
 *     tags: [Workers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del trabajador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkerInput'
 *     responses:
 *       200:
 *         description: Trabajador actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Worker'
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Trabajador no encontrado
 *       500:
 *         description: Error en el servidor
 */
router.put('/:id', workerController.updateWorker);

/**
 * @swagger
 * /api/workers/{id}:
 *   delete:
 *     summary: Eliminar un trabajador
 *     tags: [Workers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del trabajador
 *     responses:
 *       200:
 *         description: Trabajador eliminado exitosamente
 *       404:
 *         description: Trabajador no encontrado
 *       500:
 *         description: Error en el servidor
 */
router.delete('/:id', workerController.deleteWorker);

export default router;
