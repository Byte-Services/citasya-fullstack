import { AppDataSource } from "../../data-source.js";
import { Appointment, AppointmentStatus } from "../appointments/appointment.model.js";
import { Client } from "../clients/client.model.js";
import { Service } from "../services/service.model.js";
import { Between, Repository } from "typeorm";

/**
 * Clase de servicio para manejar la lógica de negocio del dashboard.
 */
export class DashboardService {
    private appointmentRepository: Repository<Appointment>;
    private clientRepository: Repository<Client>;
    private serviceRepository: Repository<Service>;
    private formatDateCaracas(date: Date): string {
        return new Intl.DateTimeFormat("en-CA", {
            timeZone: "America/Caracas",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        })
            .format(date)
            .replace(/\//g, "-"); // devuelve "yyyy-MM-dd"
        }

    constructor() {
        this.appointmentRepository = AppDataSource.getRepository(Appointment);
        this.clientRepository = AppDataSource.getRepository(Client);
        this.serviceRepository = AppDataSource.getRepository(Service);
    }

    /**
     * Obtiene estadísticas generales del dashboard.
     * @param startDate Fecha de inicio (string)
     * @param endDate Fecha de fin (string)
     * @returns Un objeto con las estadísticas
     */
    async getDashboardStats(startDate: string, endDate: string) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const confirmedAppointments = await this.appointmentRepository.count({
            where: {
                status: AppointmentStatus.Confirmado,
                date: Between(start, end)
            }
        });

        const pendingAppointments = await this.appointmentRepository.count({
            where: {
                status: AppointmentStatus.Pendiente,
                date: Between(start, end)
            }
        });

        const cancelledAppointments = await this.appointmentRepository.count({
            where: {
                status: AppointmentStatus.Cancelado,
                date: Between(start, end)
            }
        });

        const newClients = await this.clientRepository.count({
            where: {
                createdAt: Between(start, end)
            }
        });

        return {
            confirmedAppointments,
            pendingAppointments,
            cancelledAppointments,
            newClients
        };
    }

    /**
     * Obtiene la lista de citas en un rango de fechas.
     * @param startDate Fecha de inicio (string)
     * @param endDate Fecha de fin (string)
     * @returns Array de citas con relaciones
     */
    async getAppointmentsByDateRange(startDate: string, endDate: string) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const appointments = await this.appointmentRepository.find({
            where: {
                date: Between(start, end)
            },
            relations: ['client', 'worker', 'service'],
            order: {
                date: 'ASC',
                hour: 'ASC'
            }
        });

        return appointments;
    }

    /**
     * Obtiene los datos del gráfico de servicios en un rango de fechas.
     * @param startDate Fecha de inicio (string)
     * @param endDate Fecha de fin (string)
     * @returns Array de objetos con label, value y color
     */
    async getServicesChartData(startDate: string, endDate: string) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const result = await this.appointmentRepository
            .createQueryBuilder('appointment')
            .innerJoin('appointment.service', 'service')
            .select('service.name', 'label')
            .addSelect('COUNT(appointment.id)', 'value')
            .where('appointment.date BETWEEN :start AND :end', { start, end })
            .groupBy('service.name')
            .getRawMany();

        const colors = ['#447F98', '#B9D8E1', '#629BB5', '#A5C2D6'];

        return result.map((item: any, index: number) => ({
            label: item.label,
            value: parseInt(item.value),
            color: colors[index % colors.length]
        }));
    }

    /**
     * Obtiene los ingresos por cita en un rango de fechas.
     */
    async getRevenueByDateRange(startDate: string, endDate: string) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Trae solo citas concluidas con servicio para poder sumar precios
        const appointments = await this.appointmentRepository.find({
            where: {
            status: AppointmentStatus.Concluida,
            date: Between(start, end),
            },
            relations: ["service"],
            order: { date: "ASC", hour: "ASC" },
        });

        const revenueMap: Record<string, number> = {};

        // Si start y end son el mismo día => agrupamos por hora
        const sameDay = start.toDateString() === end.toDateString();
        appointments.forEach((appt) => {
        const amount = Number(appt.service?.price ?? 0);

        let key: string;
        if (sameDay) {
            key = appt.hour ? appt.hour.toString().slice(0, 5) : "00:00";
        } else {
            // ✅ Usa la fecha en Caracas, no en UTC
            key = this.formatDateCaracas(new Date(appt.date));
        }

        revenueMap[key] = (revenueMap[key] || 0) + amount;
        });



        const result = Object.entries(revenueMap).map(([key, total]) => ({
            date: key,
            total,
        }));

        // ordenar cronológicamente (si es por hora => lexicográfico funciona, si es fecha => new Date)
        result.sort((a, b) => {
            if (sameDay) return a.date.localeCompare(b.date);
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        return result;
    }

}