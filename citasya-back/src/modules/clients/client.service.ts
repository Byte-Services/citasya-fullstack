import { AppDataSource } from "../../data-source.js";
import { Client } from "./client.model.js";
import { Appointment, AppointmentStatus } from "../appointments/appointment.model.js";

/**
 * Clase de servicio para manejar la lógica de negocio de los clientes.
 */
export class ClientService {
    private clientRepository = AppDataSource.getRepository(Client);
    private appointmentRepository = AppDataSource.getRepository(Appointment);

    // --- Helper para calcular diferencia en días ---
    private getDaysDiff(from: Date, to: Date): number {
        const diffMs = to.getTime() - from.getTime();
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    }

    // --- Lógica para calcular estado del cliente ---
    private getClientStatus(client: Client): string {
        if (!client.appointments) return "Sin datos";

        const concluidas = client.appointments
            .filter(a => a.status === AppointmentStatus.Concluida)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (concluidas.length === 0) {
            return "Prospecto"; // si decides mostrarlo
        }

        if (concluidas.length === 1) {
            return "Nuevo Cliente";
        }

        const lastAppointment = new Date(concluidas[0].date);
        const today = new Date();
        const daysSinceLast = this.getDaysDiff(lastAppointment, today);

        // Perdido
        if (daysSinceLast > 183) return "Cliente Perdido";

        // Inactivo
        if (daysSinceLast > 60) return "Cliente Inactivo";

        // Calcular ticket promedio
        const totalGastado = concluidas.reduce(
            (sum, appt) => sum + (appt.service?.price ? Number(appt.service.price) : 0),
            0
        );
        const ticketPromedio = totalGastado / concluidas.length;

        // Ajusta los umbrales según tu negocio
        if (concluidas.length >= 5 && ticketPromedio > 50) {
            return "Cliente Frecuente / VIP";
        }

        return "Cliente Activo / Recurrente";
    }

    /**
     * Busca un cliente por ID, incluyendo su historial de citas.
     */
    public async findClientById(id: number): Promise<any | null> {
        const client = await this.clientRepository.findOne({
            where: { id },
            relations: ["appointments", "appointments.service"]
        });

        if (!client) return null;

        const status = this.getClientStatus(client);

        return {
            ...client,
            status
        };
    }

    /**
     * Obtiene todos los clientes con su etiqueta de segmentación.
     */
    public async findAllClients(): Promise<any[]> {
        const clients = await this.clientRepository.find({
            relations: ["appointments", "appointments.service"]
        });

        return clients.map(client => ({
            ...client,
            status: this.getClientStatus(client)
        }));
    }


    /**
     * Busca un cliente por su número de documento.
     */
    public async findClientByDocumentId(documentId: string): Promise<Client | null> {
        return this.clientRepository.findOne({
            where: { documentId },
            relations: ["appointments"] 
        });
    }

    /**
     * Crea un nuevo cliente en la base de datos.
     */
    public async createClient(clientData: Partial<Client>): Promise<Client> {
        if (!clientData.notes || clientData.notes.trim() === "") {
            clientData.notes = "Sin notas registradas";
        }
        const newClient = this.clientRepository.create(clientData);
        return this.clientRepository.save(newClient);
        }


    /**
     * Actualiza un cliente existente.
     */
    public async updateClient(id: number, clientData: Partial<Client>): Promise<Client | null> {
        const client = await this.clientRepository.findOneBy({ id });
        if (!client) {
            return null;
        }

        this.clientRepository.merge(client, clientData);
        return this.clientRepository.save(client);
    }

    /**
     * Elimina un cliente si no tiene citas pendientes o confirmadas.
     */
    public async deleteClient(id: number): Promise<{ success: boolean; reason?: string }> {
        const client = await this.clientRepository.findOne({
            where: { id },
            relations: ["appointments"],
        });

        if (!client) {
            return { success: false, reason: "Cliente no encontrado" };
        }

        // Verificar citas activas
        const hasActiveAppointments = client.appointments.some(
            (appt) => appt.status === "Pendiente" || appt.status === "Confirmado"
        );

        if (hasActiveAppointments) {
            return { success: false, reason: "El cliente tiene citas activas y no puede ser eliminado" };
        }

        await this.clientRepository.remove(client);
        return { success: true };
    }
}
