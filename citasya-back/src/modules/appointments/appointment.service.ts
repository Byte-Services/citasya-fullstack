import { AppDataSource } from "../../data-source.js";
import { BaseOrmService } from "../common/baseOrmService.js";
import { Appointment } from "./appointment.model.js";
import { CreateAppointmentInput, UpdateAppointmentInput } from "./appointment.dto.js";

/**
 * Clase de servicio para manejar la lógica de negocio de las citas.
 */
export class AppointmentsService extends BaseOrmService<Appointment> {
    constructor() {
        super(AppDataSource.getRepository(Appointment));
    }

    /**
     * Obtiene todas las citas, cargando también los datos de cliente, profesional y servicio.
     */
    async findAllAppointments(): Promise<Appointment[]> {
        return this.findAll({
            relations: ["client", "worker", "service"],
            order: { date: "DESC", hour: "DESC" }
        });
    }

    async findAppointmentById(id: number): Promise<Appointment> {
        return this.findOneWithOptions({
            where: { id },
            relations: ["client", "worker", "service"]
        });
    }

    async createAppointment(data: CreateAppointmentInput): Promise<Appointment> {
        return this.create(data);
    }

    async updateAppointment(id: number, data: UpdateAppointmentInput): Promise<Appointment> {
        return this.update(id, data);
    }

    async deleteAppointment(id: number) {
        return this.delete(id);
    }
}
