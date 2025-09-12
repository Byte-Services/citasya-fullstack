import { AppDataSource } from "../../data-source.js";
import { Appointment, AppointmentStatus } from "./appointment.model.js";
import { Client } from "../clients/client.model.js";
import { Worker } from "../workers/worker.model.js";
import { Service } from "../services/service.model.js";
import { Repository } from "typeorm";
import { google } from "googleapis"; 

// Configuración de Google Calendar API
const SERVICE_ACCOUNT_KEY_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || './service_account_key.json';
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

// Autenticación con Google API
const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_KEY_PATH,
    scopes: ['https://www.googleapis.com/auth/calendar'],
});

const calendar = google.calendar({ version: 'v3', auth });

export class AppointmentsService {
    private appointmentRepository: Repository<Appointment>;
    private clientRepository: Repository<Client>;
    private workerRepository: Repository<Worker>;
    private serviceRepository: Repository<Service>;

    constructor() {
        this.appointmentRepository = AppDataSource.getRepository(Appointment);
        this.clientRepository = AppDataSource.getRepository(Client);
        this.workerRepository = AppDataSource.getRepository(Worker);
        this.serviceRepository = AppDataSource.getRepository(Service);
    }

    /**
     * Obtiene todas las citas de la base de datos.
     */
    async findAll(): Promise<Appointment[]> {
        return this.appointmentRepository.find({
            relations: ["client", "worker", "service"],
            order: { date: "DESC", hour: "DESC" },
            take: 100,
        });
    }

    /**
     * Crea una cita y la registra en Google Calendar.
     */
    async createAppointment(data: {
        clientDocumentId: string;
        serviceId: number;
        workerId: number;
        date: string;
        hour: string;
    }): Promise<Appointment> {
        try {
            const queryRunner = AppDataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();

            let savedAppointment: Appointment;

            try {
            // 1. Buscar cliente
            const client = await this.clientRepository.findOne({
                where: { documentId: data.clientDocumentId },
            });

            if (!client) {
                throw new Error(
                "Cliente no encontrado. Verifique el documento de identidad."
                );
            }

            // 2. Buscar el servicio y trabajador
            const service = await this.serviceRepository.findOneBy({
                id: data.serviceId,
            });
            const worker = await this.workerRepository.findOneBy({
                id: data.workerId,
            });

            if (!service) {
                throw new Error("Servicio no encontrado");
            }

            if (!worker) {
                throw new Error("Especialista no encontrado");
            }

            // 3. Crear y guardar la cita en la base de datos
            const [year, month, day] = data.date.split("-").map(Number);
            const localDate = new Date(year, month - 1, day);

            // Calcular end_time
            const [hour, minute] = data.hour.split(":").map(Number);
            const startDate = new Date(year, month - 1, day, hour, minute);
            const serviceDuration = service?.minutes_duration || 60;
            const endDate = new Date(startDate.getTime() + serviceDuration * 60 * 1000);
            const end_time = endDate.toTimeString().slice(0, 5); // formato "HH:MM"

            const appointment = this.appointmentRepository.create({
                date: localDate,
                hour: data.hour,
                end_time, // <--- aquí se guarda
                status: AppointmentStatus.Pendiente,
                client,
                service,
                worker,
            });

            savedAppointment = await queryRunner.manager.save(appointment);

            // 4. Crear el evento en Google Calendar
            const startDateTime = new Date(`${data.date}T${data.hour}:00`);
            const calendarDuration = service.minutes_duration || 60;
            const endDateTime = new Date(
                startDateTime.getTime() + calendarDuration * 60 * 1000
            );

            const event = {
                summary: `Cita Spa: ${service.name} - ${client.name}`,
                description: `Servicio: ${service.name}\nCliente: ${client.name}\nTeléfono: ${client.phone}\nEspecialista: ${worker.name}`,
                start: {
                dateTime: startDateTime.toISOString(),
                timeZone: "America/Caracas",
                },
                end: {
                dateTime: endDateTime.toISOString(),
                timeZone: "America/Caracas",
                },
            };

            try {
                const calendarResponse = await calendar.events.insert({
                calendarId: CALENDAR_ID,
                requestBody: event,
                });

                if (calendarResponse.data.id) {
                savedAppointment.calendar_event_id = calendarResponse.data.id;
                await queryRunner.manager.save(savedAppointment); // actualizar con google_event_id
                }
            } catch (calendarError) {
                console.error("Error creando evento en Google Calendar:", calendarError);
                // No revertimos la transacción de BD si falla Google Calendar
            }

            await queryRunner.commitTransaction();
            return savedAppointment;
            } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
            } finally {
            await queryRunner.release();
            }
        } catch (error) {
            throw error;
        }
    }


    /**
     * Actualiza el estado de una cita.
    */
    async updateStatus(id: number, status: string): Promise<Appointment> {
        const appointment = await this.appointmentRepository.findOne({
            where: { id },
            relations: ["client", "worker", "service"]
        });

        if (!appointment) {
            throw new Error("Cita no encontrada");
        }

        // Si se cancela, eliminar el evento de Google Calendar
        if (status === AppointmentStatus.Cancelado && appointment.calendar_event_id) {
            try {
            await calendar.events.delete({
                calendarId: CALENDAR_ID,
                eventId: appointment.calendar_event_id,
            });
            appointment.calendar_event_id = ''; // limpiar el eventId
            } catch (err) {
            console.error("Error eliminando evento en Google Calendar:", err);
            }
        }

        appointment.status = status as AppointmentStatus;
        return this.appointmentRepository.save(appointment);
    }

}
