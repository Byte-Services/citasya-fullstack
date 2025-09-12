import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, OneToMany, JoinColumn } from "typeorm";
import { Specialty } from "../specialties/specialty.model.js";
import { Worker } from "../workers/worker.model.js";
import { Appointment } from "../appointments/appointment.model.js";

/**
 * Enum para el estado de un servicio.
 */
export enum ServiceStatus {
    Activo = "Activo",
    Inactivo = "Inactivo"
}

/**
 * Entidad de TypeORM para la tabla 'Services'.
 * Representa un modelo de datos para un servicio.
 */
@Entity("services")
export class Service {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar" })
    name!: string;

    @Column({ type: "text", nullable: true })
    description!: string;

    @Column({ type: "int", nullable: true })
    minutes_duration!: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    price!: number;

    @Column({
        type: "enum",
        enum: ServiceStatus
    })
    status!: ServiceStatus;

    @Column({ type: "int", nullable: true })
    specialty_id!: number;

    @ManyToOne(() => Specialty, specialty => specialty.services, { eager: true })
    @JoinColumn({ name: "specialty_id" })
    specialty!: Specialty;

    @ManyToMany(() => Worker, worker => worker.services)
    workers!: Worker[];

    @OneToMany(() => Appointment, appointment => appointment.service)
    appointment!: Appointment[];
}
