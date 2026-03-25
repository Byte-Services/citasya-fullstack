import { Request, Response } from 'express';
import { AppointmentsService } from './appointment.service.js';
import { CreateAppointmentDto, UpdateAppointmentDto } from './appointment.dto.js';

export class AppointmentsController {
    private appointmentsService: AppointmentsService;

    constructor() {
        this.appointmentsService = new AppointmentsService();
    }

    public getAllAppointments = async (req: Request, res: Response): Promise<void> => {
        try {
            const appointments = await this.appointmentsService.findAllAppointments();
            res.status(200).json(appointments);
        } catch (error: any) {
            console.error('Error al obtener citas:', error);
            res.status(500).json({ message: 'Error al obtener citas.', error: error.message });
        }
    }

    public getAppointmentById = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const appointment = await this.appointmentsService.findAppointmentById(parseInt(id));

            if (!appointment) {
                res.status(404).json({ message: "Cita no encontrada." });
                return;
            }

            res.status(200).json(appointment);
        } catch (error: any) {
            console.error("Error fetching appointment:", error);
            res.status(500).json({ message: "Error al obtener la cita.", error: error.message });
        }
    }

    public createAppointment = async (req: Request, res: Response): Promise<void> => {
        try {
            const validationResult = CreateAppointmentDto.safeParse(req.body);

            if (!validationResult.success) {
                res.status(400).json({ 
                    message: "Datos de entrada inválidos", 
                    errors: validationResult.error.errors 
                });
                return;
            }

            const newAppointment = await this.appointmentsService.createAppointment(validationResult.data);
            res.status(201).json(newAppointment);
        } catch (error: any) {
            console.error("Error creating appointment:", error);
            res.status(500).json({ message: "Error al crear la cita.", error: error.message });
        }
    }

    public updateAppointment = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const validationResult = UpdateAppointmentDto.safeParse(req.body);

            if (!validationResult.success) {
                res.status(400).json({ 
                    message: "Datos de entrada inválidos", 
                    errors: validationResult.error.errors 
                });
                return;
            }

            const updatedAppointment = await this.appointmentsService.updateAppointment(parseInt(id), validationResult.data);
            res.status(200).json(updatedAppointment);
        } catch (error: any) {
            console.error("Error updating appointment:", error);
            res.status(500).json({ message: "Error al actualizar la cita.", error: error.message });
        }
    }

    public deleteAppointment = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            await this.appointmentsService.deleteAppointment(parseInt(id));
            res.status(200).json({ message: "Cita eliminada exitosamente." });
        } catch (error: any) {
            console.error("Error deleting appointment:", error);
            res.status(500).json({ message: "Error al eliminar la cita.", error: error.message });
        }
    }
}
