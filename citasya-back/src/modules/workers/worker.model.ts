import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinTable, ManyToMany } from "typeorm";
import { Appointment } from "../appointments/appointment.model.js";
import { Service } from "../services/service.model.js";

/**
 * Enum para el estado de un trabajador.
 */
export enum WorkerStatus {
    Activo = "Activo",
    Inactivo = "Inactivo"
}

/**
 * Entidad de TypeORM para la tabla 'Workers'.
 * Representa un modelo de datos para un trabajador.
 */
@Entity("workers")
export class Worker {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar" })
    name!: string;

    @Column({ type: "varchar", unique: true, nullable: true })
    documentId!: string;

    @Column({ type: "varchar", nullable: true })
    phone!: string;

    @Column({ type: "varchar", unique: true, nullable: true })
    email!: string;

    @Column({ type: "jsonb", nullable: true })
    schedule!: object;

    @Column({
        type: "enum",
        enum: WorkerStatus
    })
    status!: WorkerStatus;

    @OneToMany(() => Appointment, (appointment: Appointment) => appointment.worker)
    appointments!: Appointment[];

    @ManyToMany(() => Service)
    @JoinTable({
        name: "services_per_worker",
        joinColumn: {
            name: "worker_id",
            referencedColumnName: "id"
        },
        inverseJoinColumn: {
            name: "service_id",
            referencedColumnName: "id"
        }
    })
    services!: Service[];

}
