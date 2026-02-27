import { Router } from 'express';
import { SpecialtiesController } from './specialty.controller.js';

const router = Router();
const specialtiesController = new SpecialtiesController();

/**
 * @swagger
 * /admin/specialties:
 *   get:
 *     summary: Obtener todas las especialidades
 *     description: Retorna una lista de todas las especialidades registradas
 *     tags: [Specialties]
 *     responses:
 *       200:
 *         description: Lista de especialidades
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Specialty'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', specialtiesController.getAllSpecialties);

/**
 * @swagger
 * /admin/specialties:
 *   post:
 *     summary: Crear una nueva especialidad
 *     description: Crea una nueva especialidad en el sistema
 *     tags: [Specialties]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SpecialtyInput'
 *     responses:
 *       201:
 *         description: Especialidad creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Specialty'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', specialtiesController.createSpecialty);

/**
 * @swagger
 * /admin/specialties/{id}:
 *   put:
 *     summary: Actualizar una especialidad
 *     description: Actualiza los datos de una especialidad existente
 *     tags: [Specialties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la especialidad
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SpecialtyInput'
 *     responses:
 *       200:
 *         description: Especialidad actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Specialty'
 *       404:
 *         description: Especialidad no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', specialtiesController.updateSpecialty);

/**
 * @swagger
 * /admin/specialties/{id}:
 *   delete:
 *     summary: Eliminar una especialidad
 *     description: Elimina una especialidad del sistema
 *     tags: [Specialties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la especialidad
 *     responses:
 *       200:
 *         description: Especialidad eliminada exitosamente
 *       404:
 *         description: Especialidad no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', specialtiesController.deleteSpecialty);

export default router;
