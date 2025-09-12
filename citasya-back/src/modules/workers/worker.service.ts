import { AppDataSource } from "../../data-source.js";
import { Worker } from "./worker.model.js";
import { Service } from "../services/service.model.js";
import { Appointment } from "../appointments/appointment.model.js";
import { In } from "typeorm";

/**
 * Servicio para operaciones CRUD de trabajadores.
 */
export class WorkerService {
  private workerRepository = AppDataSource.getRepository(Worker);
  private serviceRepository = AppDataSource.getRepository(Service);

  /**
   * Obtiene todos los trabajadores con sus servicios.
   */
  async findAll(): Promise<Worker[]> {
    return this.workerRepository.find({
      relations: ["services", "services.specialty"],
    });
  }

  async findById(id: number): Promise<Worker | null> {
    return this.workerRepository.findOne({
      where: { id },
      relations: ["services", "services.specialty"],
    });
  }

  /**
   * Crea un nuevo trabajador y asocia servicios si se indican.
   */
  async create(workerData: Partial<Worker>): Promise<Worker> {
    try {
      const newWorker = this.workerRepository.create(workerData);

      if (Array.isArray(workerData.services) && workerData.services.length > 0) {
        const ids = workerData.services.map((s: any) =>
          typeof s === "object" ? Number(s.id) : Number(s)
        );
        const serviceEntities = await this.serviceRepository.findBy({ id: In(ids) });
        newWorker.services = serviceEntities;
      }

      return await this.workerRepository.save(newWorker);
    } catch (error: any) {
      if (error.code === '23505') {
        if (error.detail.includes('documentId')) {
          throw new Error('Ya existe un especialista con esa cédula');
        }
        if (error.detail.includes('email')) {
          throw new Error('Ya existe un especialista con ese correo');
        }
        throw new Error('Ya existe un especialista con ese dato único');
      }
      throw error;
    }
  }

  /**
   * Actualiza los datos de un trabajador y sus servicios.
   */
  async update(id: number, workerData: Partial<Worker>): Promise<Worker> {
    try {
      const workerToUpdate = await this.workerRepository.findOne({ where: { id } });

      if (!workerToUpdate) {
        throw new Error("Worker not found");
      }

      this.workerRepository.merge(workerToUpdate, workerData);

      if (Array.isArray(workerData.services) && workerData.services.length > 0) {
        const ids = workerData.services.map((s: any) =>
          typeof s === "object" ? Number(s.id) : Number(s)
        );
        const serviceEntities = await this.serviceRepository.findBy({ id: In(ids) });
        workerToUpdate.services = serviceEntities;
      }

      return await this.workerRepository.save(workerToUpdate);
    } catch (error: any) {
      if (error.code === '23505') {
        if (error.detail.includes('documentId')) {
          throw new Error('Ya existe un especialista con esa cédula');
        }
        if (error.detail.includes('email')) {
          throw new Error('Ya existe un especialista con ese correo');
        }
        throw new Error('Ya existe un especialista con ese dato único');
      }
      throw error;
    }
  }

  /**
   * Elimina un trabajador por su ID.
   */
  async delete(id: number): Promise<{ success: boolean; reason?: string }> {
    const worker = await this.workerRepository.findOne({
      where: { id },
      relations: ["appointments"],
    });

    if (!worker) {
      return { success: false, reason: "Especialista no encontrado" };
    }

    const appointments = worker.appointments ?? [];

    // Si hay alguna pendiente o confirmada -> no borrar
    const hasActiveAppointments = appointments.some(
      (appt) => appt?.status === "Pendiente" || appt?.status === "Confirmado"
    );

    if (hasActiveAppointments) {
      return {
        success: false,
        reason:
          "No se puede eliminar el especialista porque tiene citas pendientes o confirmadas",
      };
    }

    // Si todas son Concluidas o Canceladas, liberamos la FK antes de borrar
    if (appointments.length > 0) {
      for (const appt of appointments) {
        appt.worker = null as any; // o appt.worker_id = null si lo manejas manual
      }
      await AppDataSource.getRepository(Appointment).save(appointments);
    }

    await this.workerRepository.remove(worker);
    return { success: true };
  }


}
