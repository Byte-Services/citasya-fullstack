import { Request, Response } from "express";
import { AppointmentsService } from "./appointment.service.js";
import { Worker } from "../workers/worker.model.js"; 
import { AppDataSource } from "../../data-source.js";
import { Appointment } from "./appointment.model.js";

// Instancia del servicio de citas
const appointmentsService = new AppointmentsService();

/**
 * Controlador para las rutas relacionadas con citas.
 * Gestiona las operaciones de consulta, creación y actualización de citas.
 */
export class AppointmentsController {
  private workerRepository = AppDataSource.getRepository(Worker);
  private appointmentRepository = AppDataSource.getRepository(Appointment);
  /**
   * Obtiene todas las citas.
   * @param req - Solicitud HTTP
   * @param res - Respuesta HTTP
   * @returns Lista de citas en formato JSON
   */
  async getAllAppointments(req: Request, res: Response): Promise<Response> {
    try {
      const appointments = await appointmentsService.findAll();
      return res.json(appointments);
    } catch (error) {
      return res.status(500).json({ error: "Error al obtener citas." });
    }
  }

  /**
   * Crea una nueva cita.
   * @param req - Solicitud HTTP con los datos de la cita en el cuerpo
   * @param res - Respuesta HTTP
   * @returns La cita creada en formato JSON
   */
  async createAppointment(req: Request, res: Response): Promise<Response> {
    try {
      const { clientDocumentId, serviceId, workerId, date, hour } = req.body;

      // Validación de datos obligatorios
      if (!clientDocumentId || !serviceId || !workerId || !date || !hour) {
        return res.status(400).json({ error: "Faltan datos obligatorios" });
      }

      // Validación fecha futura
      const selectedDateTime = new Date(`${date}T${hour}`);
      const now = new Date();
      if (selectedDateTime < now) {
        return res.status(400).json({ error: "No se puede crear una cita en una fecha/hora pasada" });
      }

      const appointment = await appointmentsService.createAppointment({
        clientDocumentId,
        serviceId,
        workerId,
        date,
        hour,
      });

      return res.status(201).json(appointment);
    } catch (error: any) {
      if (error.message?.includes("Cliente no encontrado")) {
        return res.status(400).json({ error: "Cliente no registrado. Verifique el documento de identidad." });
      }

      return res.status(500).json({ error: "Error al crear cita." });
    }
  }


  /**
   * Actualiza el estado de una cita.
   * @param req - Solicitud HTTP con el ID de la cita y el nuevo estado
   * @param res - Respuesta HTTP
   * @returns La cita actualizada en formato JSON
   */
  async updateStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validación del nuevo estado
      if (!status) {
        return res.status(400).json({ error: "Se requiere el nuevo estado." });
      }

      const updatedAppointment = await appointmentsService.updateStatus(Number(id), status);

      return res.json(updatedAppointment);
    } catch (error) {
      return res.status(500).json({ error: "Error al actualizar estado de cita." });
    }
  }

    /**
   * Obtiene los horarios disponibles para un especialista en una fecha específica.
   * Genera los slots de 15 minutos según el horario del especialista y filtra los que ya están ocupados por citas pendientes o confirmadas.
   * @param req - Debe incluir workerId y date en query params
   * @param res - Devuelve un array de strings con los horarios disponibles
   */
    async getAvailableSlots(req: Request, res: Response) {
      try {
        const { workerId, date } = req.query;

        if (!workerId || !date) {
          return res.status(400).json({ error: "workerId y date son requeridos" });
        }

        const workerRepo = AppDataSource.getRepository(Worker);
        const worker = await workerRepo.findOne({
          where: { id: Number(workerId) },
          relations: ["appointments", "services"],
        });

        if (!worker) {
          return res.status(404).json({ error: "Especialista no encontrado" });
        }

        if (!worker.schedule) {
          return res.status(400).json({ error: "El especialista no tiene horario configurado" });
        }

        const dayOfWeek = new Date(`${date}T00:00:00-04:00`).toLocaleDateString("en-US", { weekday: "short" });
        const scheduleDay = worker.schedule.days[dayOfWeek as keyof typeof worker.schedule.days];

        if (!scheduleDay?.enabled) {
          return res.json({ slots: [] });
        }

        const slots: string[] = [];
        const start = new Date(`${date}T${scheduleDay.startTime}`);
        const end = new Date(`${date}T${scheduleDay.endTime}`);

        for (let t = new Date(start); t < end; t.setMinutes(t.getMinutes() + 15)) {
          slots.push(t.toTimeString().slice(0, 5));
        }

        // Filtrar los ocupados
        const queryDate = new Date(date as string);
        const allTakenSlots: string[] = [];

        worker.appointments
            .filter((a: Appointment) => {
                const appointmentDate = new Date(a.date);
                const isSameDay =
                    appointmentDate.getFullYear() === queryDate.getFullYear() &&
                    appointmentDate.getMonth() === queryDate.getMonth() &&
                    appointmentDate.getDate() === queryDate.getDate();

                // Asegúrate de filtrar solo las citas que están Pendientes o Confirmadas
                return isSameDay && ["Pendiente", "Confirmado"].includes(a.status);
            })
            .forEach((a: Appointment) => {
                // Genera un rango de slots de 15 minutos entre la hora de inicio y de fin de la cita
                const startDateTime = new Date(`${date}T${a.hour}`);
                const endDateTime = new Date(`${date}T${a.end_time}`);

                for (let t = new Date(startDateTime); t < endDateTime; t.setMinutes(t.getMinutes() + 15)) {
                    allTakenSlots.push(t.toTimeString().slice(0, 5));
                }
            });

        const available = slots.filter(slot => !allTakenSlots.includes(slot));

        return res.json({ slots: available });
      } catch (err) {
        return res.status(500).json({ error: "Error obteniendo horarios disponibles" });
      }
    }
}