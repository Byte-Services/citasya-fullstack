import { Request, Response } from 'express';
import { WorkerService } from './worker.services.js';
import { z } from 'zod';
import { CreateWorkerDto, UpdateWorkerDto } from './worker.dto.js';

export class WorkerController {
    private workerService: WorkerService;

    constructor() {
        this.workerService = new WorkerService();
    }

    public getAllWorkers = async (req: Request, res: Response): Promise<void> => {
        try {
            const workers = await this.workerService.findAllWorkers();
            res.status(200).json(workers);
        } catch (error: any) {
            console.error("Error fetching workers:", error);
            res.status(500).json({ message: "Error al obtener los trabajadores.", error: error.message });
        }
    }

    public getWorkerById = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const worker = await this.workerService.findWorkerById(parseInt(id));

            if (!worker) {
                res.status(404).json({ message: "Trabajador no encontrado." });
                return;
            }

            res.status(200).json(worker);
        } catch (error: any) {
            console.error("Error fetching worker:", error);
            res.status(500).json({ message: "Error al obtener el trabajador.", error: error.message });
        }
    }

    public createWorker = async (req: Request, res: Response): Promise<void> => {
        try {
            const validationResult = CreateWorkerDto.safeParse(req.body);

            if (!validationResult.success) {
                res.status(400).json({ 
                    message: "Datos de entrada inválidos", 
                    errors: validationResult.error.errors 
                });
                return;
            }

            const newWorker = await this.workerService.createWorker(validationResult.data);
            res.status(201).json(newWorker);
        } catch (error: any) {
            console.error("Error creating worker:", error);
            res.status(500).json({ message: "Error al crear el trabajador.", error: error.message });
        }
    }

    public updateWorker = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const validationResult = UpdateWorkerDto.safeParse(req.body);

            if (!validationResult.success) {
                res.status(400).json({ 
                    message: "Datos de entrada inválidos", 
                    errors: validationResult.error.errors 
                });
                return;
            }

            const updatedWorker = await this.workerService.updateWorker(parseInt(id), validationResult.data);
            res.status(200).json(updatedWorker);
        } catch (error: any) {
            console.error("Error updating worker:", error);
            res.status(500).json({ message: "Error al actualizar el trabajador.", error: error.message });
        }
    }

    public deleteWorker = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            await this.workerService.deleteWorker(parseInt(id));
            res.status(200).json({ message: "Trabajador eliminado exitosamente." });
        } catch (error: any) {
            console.error("Error deleting worker:", error);
            res.status(500).json({ message: "Error al eliminar el trabajador.", error: error.message });
        }
    }
}
