import { AppDataSource } from "../../data-source.js";
import { Service, ServiceStatus } from "./service.model.js";
import { Specialty } from "../specialties/specialty.model.js";
import { Repository } from "typeorm";

/**
 * Clase de servicio para manejar la lógica de negocio de los servicios.
 */
export class ServicesService {
        private normalizeStatus(status: string): ServiceStatus | null {
            if (!status) return null;

            const normalizedStatus = status.toLowerCase();
            if (normalizedStatus === 'active') {
                return ServiceStatus.Activo;
            }

            if (normalizedStatus === 'inactive') {
                return ServiceStatus.Inactivo;
            }

            return null;
        }

    private serviceRepository: Repository<Service>;
    private specialtyRepository: Repository<Specialty>;

    constructor() {
        this.serviceRepository = AppDataSource.getRepository(Service);
        this.specialtyRepository = AppDataSource.getRepository(Specialty);
    }

    /**
     * Obtiene todos los servicios, incluyendo su especialidad relacionada.
     */
    async findAll(): Promise<Service[]> {
        return this.serviceRepository.find({
            relations: ["specialty"],
            order: { name: "ASC" }
        });
    }

    /**
     * Crea un nuevo servicio.
     * @param serviceData Los datos del servicio a crear.
     */
    async create(serviceData: { name: string, specialty_id: number, description: string, minutes_duration: number, price: number, status: string }): Promise<Service | null> {
        const specialtyId = serviceData.specialty_id;
        if (!specialtyId) {
            return null;
        }

        const specialty = await this.specialtyRepository.findOneBy({ id: specialtyId });
        if (!specialty) {
            return null; // Retorna null si la especialidad no existe
        }

        // Validación y asignación del estado
        const serviceStatus = this.normalizeStatus(serviceData.status);
        if (!serviceStatus) {
            // Maneja el caso de un estado no válido si es necesario
            console.error('Estado de servicio no válido:', serviceData.status);
            return null;
        }

        const newService = this.serviceRepository.create({
            name: serviceData.name,
            specialty, // Asigna la entidad completa
            description: serviceData.description,
            minutes_duration: serviceData.minutes_duration,
            price: serviceData.price,
            status: serviceStatus
        });

        return this.serviceRepository.save(newService);
    }

    /**
     * Actualiza un servicio existente.
     * @param id El ID del servicio a actualizar.
     * @param serviceData Los datos actualizados.
     */
    async update(id: number, serviceData: { name: string, specialty_id: number, description: string, minutes_duration: number, price: number, status: string }): Promise<Service | null> {
        const serviceToUpdate = await this.serviceRepository.findOneBy({ id });
        if (!serviceToUpdate) {
            return null;
        }

        const specialtyId = serviceData.specialty_id;
        if (!specialtyId) {
            return null;
        }

        const specialty = await this.specialtyRepository.findOneBy({ id: specialtyId });
        if (!specialty) {
            return null;
        }

        // Validación y asignación del estado
        const serviceStatus = this.normalizeStatus(serviceData.status);
        if (!serviceStatus) {
            // Maneja el caso de un estado no válido si es necesario
            console.error('Estado de servicio no válido:', serviceData.status);
            return null;
        }

        serviceToUpdate.name = serviceData.name;
        serviceToUpdate.specialty = specialty;
        serviceToUpdate.description = serviceData.description;
        serviceToUpdate.minutes_duration = serviceData.minutes_duration;
        serviceToUpdate.price = serviceData.price;
        serviceToUpdate.status = serviceStatus;

        return this.serviceRepository.save(serviceToUpdate);
    }

    /**
     * Elimina un servicio por su ID.
     * @param id El ID del servicio a eliminar.
     */
    async delete(id: number): Promise<boolean> {
        const result = await this.serviceRepository.delete(id);
        return result.affected !== 0;
    }
}