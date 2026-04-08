import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, OneToMany, JoinColumn, Relation } from "typeorm";
import { Specialty } from "../specialties/specialty.model.js";
import { Worker } from "../workers/worker.model.js";
import { Appointment } from "../appointments/appointment.model.js";

/**
 * Enumeración para el estado de un servicio.
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
    specialty!: Relation<Specialty>;

    @ManyToMany(() => Worker)
    workers!: Relation<Worker[]>;

    @OneToMany(() => Appointment, appointment => appointment.service)
    appointments!: Relation<Appointment[]>;
}
