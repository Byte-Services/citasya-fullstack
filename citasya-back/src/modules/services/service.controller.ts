import { Request, Response } from 'express';
import { ServicesService } from './service.service.js';

const servicesService = new ServicesService();

export class ServicesController {
    /**
     * Obtiene todos los servicios.
     * @return JSON con la lista de servicios o mensaje de error.
     */
    async getAllServices(req: Request, res: Response): Promise<Response> {
        try {
            const services = await servicesService.findAll();
            return res.json(services);
        } catch (error) {
            return res.status(500).json({ error: 'Error al obtener servicios.' });
        }
    }

    /**
     * Obtiene servicios por ID de especialidad.
     * @return JSON con los servicios encontrados o mensaje de error.
     */
    async getServicesBySpecialtyId(req: Request, res: Response): Promise<Response> {
        const specialtyId = parseInt(req.params.specialtyId);
        if (isNaN(specialtyId)) {
            return res.status(400).json({ message: 'ID de especialidad inválido.' });
        }
        
        try {
            const services = await servicesService.findBySpecialtyId(specialtyId);
            return res.status(200).json(services);
        } catch (error) {
            return res.status(500).json({ message: 'Error al obtener los servicios de la especialidad.' });
        }
    }

    /**
     * Crea un nuevo servicio.
     * @return JSON con el servicio creado o mensaje de error.
     */
    async createService(req: Request, res: Response): Promise<Response> {
        const serviceData = req.body;
        try {
            const newService = await servicesService.create(serviceData);
            if (newService === null) {
                return res.status(400).json({ error: 'Especialidad no válida.' });
            }
            if (newService === "duplicate") {
                return res.status(400).json({ error: 'Ya existe un servicio con ese nombre en esta especialidad.' });
            }
            return res.status(201).json(newService);
        } catch (error) {
            return res.status(500).json({ error: 'Error al crear el servicio.' });
        }
    }

    /**
     * Actualiza un servicio existente.
     * @return JSON con el servicio actualizado o mensaje de error.
     */
    async updateService(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const serviceData = req.body;
        try {
            const updatedService = await servicesService.update(parseInt(id), serviceData);
            if (!updatedService) {
                return res.status(404).json({ error: 'Servicio o Especialidad no encontrada.' });
            }
            return res.json(updatedService);
        } catch (error) {
            return res.status(500).json({ error: 'Error al actualizar el servicio.' });
        }
    }

    /**
     * Elimina un servicio por su ID.
     * @return Respuesta vacía si se elimina o mensaje de error.
     */
    async deleteService(req: Request, res: Response): Promise<Response> {
        try {
            const id = parseInt(req.params.id);
            const deleted = await servicesService.delete(id);

            if (deleted === "hasRelations") {
                return res.status(400).json({
                    error: "No se puede eliminar el servicio: tiene citas o especialistas asociados.",
                });
            }

            if (deleted === false) {
                return res.status(404).json({ error: "Servicio no encontrado." });
            }

            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: "Error al eliminar el servicio." });
        }
    }
}