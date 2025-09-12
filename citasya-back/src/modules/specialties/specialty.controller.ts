import { Request, Response } from 'express';
import { SpecialtiesService } from './specialty.service.js';

/**
 * Clase de controlador para manejar las peticiones HTTP de especialidades.
 */
const specialtyService = new SpecialtiesService();

export class SpecialtiesController {
    /**
     * Maneja la petición GET para obtener todas las especialidades.
     */
    async getAllSpecialties(req: Request, res: Response): Promise<Response> {
        try {
            const specialties = await specialtyService.findAll();
            return res.json(specialties);
        } catch (error) {
            return res.status(500).json({ error: 'Error al obtener especialidades.' });
        }
    }

    /**
     * Maneja la petición POST para crear una nueva especialidad.
     */
    async createSpecialty(req: Request, res: Response): Promise<Response> {
        const { name } = req.body;
        try {
            const newSpecialty = await specialtyService.create(name);
            return res.status(201).json(newSpecialty);
        } catch (error) {
            return res.status(400).json({ error: (error as Error).message });
        }
    }   

    /**
     * Maneja la petición PUT para actualizar una especialidad.
     */
    async updateSpecialty(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const { name } = req.body;
        try {
            const updatedSpecialty = await specialtyService.update(parseInt(id), name);
            if (!updatedSpecialty) {
                return res.status(404).json({ error: 'Especialidad no encontrada.' });
            }
            return res.json(updatedSpecialty);
        } catch (error) {
            return res.status(500).json({ error: 'Error al actualizar la especialidad.' });
        }
    }

    /**
     * Maneja la petición DELETE para eliminar una especialidad.
     */
    async deleteSpecialty(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        try {
            const deleted = await specialtyService.delete(parseInt(id));
            if (!deleted) {
                return res.status(404).json({ error: "Especialidad no encontrada." });
            }
            return res.status(204).send();
        } catch (error) {
            return res.status(400).json({ error: (error as Error).message });
        }
    }
}
