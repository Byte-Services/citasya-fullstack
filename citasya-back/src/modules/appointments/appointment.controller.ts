import { Request, Response } from "express";
import { AppointmentsService } from "./appointment.service.js";
import { Worker } from "../workers/worker.model.js"; 
import { AppDataSource } from "../../data-source.js";
import { Appointment } from "./appointment.model.js";
import { Service } from "../services/service.model.js";

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
   * Obtiene todas las citas. Si se proporcionan fechas, filtra los resultados.
   * @param req - Solicitud HTTP con opcionalmente startDate y endDate en query params
   * @param res - Respuesta HTTP
   * @returns Lista de citas en formato JSON
   */
  async getAllAppointments(req: Request, res: Response): Promise<Response> {
    try {
      const { startDate, endDate } = req.query;

      if (startDate && endDate) {
        const appointments = await appointmentsService.findByDateRange(startDate as string, endDate as string);
        return res.json(appointments);
      } else {
        const appointments = await appointmentsService.findAll();
        return res.json(appointments);
      }
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
        const { workerId, date, serviceId } = req.query;

        if (!workerId || !date || !serviceId) {
          return res.status(400).json({ error: "workerId, date y serviceId son requeridos" });
        }

        const workerRepo = AppDataSource.getRepository(Worker);
        const serviceRepo = AppDataSource.getRepository(Service);

        // Traemos también appointments.service para poder calcular end_time si hace falta
        const worker = await workerRepo.findOne({
          where: { id: Number(workerId) },
          relations: ["appointments", "appointments.service", "services"],
        });

        if (!worker) return res.status(404).json({ error: "Especialista no encontrado" });

        if (!worker.schedule) {
          return res.status(400).json({ error: "El especialista no tiene horario configurado" });
        }

        const service = await serviceRepo.findOne({ where: { id: Number(serviceId) } });
        if (!service) return res.status(404).json({ error: "Servicio no encontrado" });

        const serviceDuration = service.minutes_duration ?? 30;

        const queryDate = new Date(date as string);
        queryDate.setHours(0, 0, 0, 0);

        const dayOfWeek = new Date(`${date}T00:00:00-04:00`).toLocaleDateString("en-US", { weekday: "short" });
        const scheduleDay = worker.schedule.days[dayOfWeek as keyof typeof worker.schedule.days];

        if (!scheduleDay?.enabled) {
          return res.json({ slots: [] });
        }

        // Jornada del worker en ese día
        const start = new Date(`${date}T${scheduleDay.startTime}`);
        const end = new Date(`${date}T${scheduleDay.endTime}`);

        // Generar slots cada 15 min
        const slots: string[] = [];
        for (let t = new Date(start); t < end; t.setMinutes(t.getMinutes() + 15)) {
          slots.push(t.toTimeString().slice(0, 5));
        }

        // Filtrar citas del mismo día y con estado activo (Pendiente, Confirmado)
        const sameDayAppointments = (worker.appointments || []).filter((a: Appointment) => {
          const appointmentDate = new Date(a.date);
          appointmentDate.setHours(0, 0, 0, 0);
          return (
            appointmentDate.getTime() === queryDate.getTime() &&
            ["Pendiente", "Confirmado"].includes(a.status)
          );
        });

        // Generar slots ocupados (por 15 min) a partir de las citas del día
        const allTakenSlots: string[] = [];
        sameDayAppointments.forEach((a: Appointment) => {
          const startDateTime = new Date(`${date}T${a.hour}`);
          let endDateTime: Date;
          if (a.end_time) {
            endDateTime = new Date(`${date}T${a.end_time}`);
          } else if ((a as any).service?.minutes_duration) {
            endDateTime = new Date(startDateTime.getTime() + ((a as any).service.minutes_duration ?? 30) * 60000);
          } else {
            endDateTime = new Date(startDateTime.getTime() + 30 * 60000);
          }

          for (let t = new Date(startDateTime); t < endDateTime; t.setMinutes(t.getMinutes() + 15)) {
            allTakenSlots.push(t.toTimeString().slice(0, 5));
          }
        });

        let available = slots.filter(slot => !allTakenSlots.includes(slot));

        // Excluir horario de descanso solo si es válido y distinto de 'none'
        if (
          worker.schedule.breakTime &&
          worker.schedule.breakTime.toString().toLowerCase() !== "none" &&
          worker.schedule.breakTime.includes("-")
        ) {
          const [breakStart, breakEnd] = worker.schedule.breakTime.split("-");
          const breakStartDate = new Date(`${date}T${breakStart}`);
          const breakEndDate = new Date(`${date}T${breakEnd}`);

          available = available.filter(slot => {
            const slotDate = new Date(`${date}T${slot}`);
            return !(slotDate.getTime() >= breakStartDate.getTime() && slotDate.getTime() < breakEndDate.getTime());
          });
        }

        // Validar que quepa el servicio completo en ese slot 
        available = available.filter(slot => {
          const slotStart = new Date(`${date}T${slot}`);
          const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000);

          // Permitir que termine exactamente en endTime 
          if (slotEnd.getTime() > end.getTime()) return false;

          // Chequear solapamiento con citas del mismo día
          for (const a of sameDayAppointments) {
            const apptStart = new Date(`${date}T${a.hour}`);
            let apptEnd: Date;
            if (a.end_time) {
              apptEnd = new Date(`${date}T${a.end_time}`);
            } else if ((a as any).service?.minutes_duration) {
              apptEnd = new Date(apptStart.getTime() + ((a as any).service.minutes_duration ?? 30) * 60000);
            } else {
              apptEnd = new Date(apptStart.getTime() + 30 * 60000);
            }

            // Si overlap: slotStart < apptEnd && slotEnd > apptStart -> solapa
            if (slotStart.getTime() < apptEnd.getTime() && slotEnd.getTime() > apptStart.getTime()) {
              return false;
            }
          }

          return true;
        });


        return res.json({ slots: available });
      } catch (err) {
        return res.status(500).json({ error: "Error obteniendo horarios disponibles" });
      }
    }

}