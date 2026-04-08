import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Relation } from "typeorm";
import { Client } from "../clients/client.model.js";
import { Worker } from "../workers/worker.model.js";
import { Service } from "../services/service.model.js";

/**
 * Enumeración para el estado de una cita.
 */
export enum AppointmentStatus {
    Pendiente = "Pendiente",
    Confirmado = "Confirmado",
    Cancelado = "Cancelado",
    Concluida = "Concluida"
}

/**
 * Entidad de TypeORM para la tabla 'Appointment'.
 * Representa un modelo de datos para una cita.
 */
@Entity("appointment")
export class Appointment {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "date" })
    date!: Date;

    @Column({ type: "date", nullable: true })
    end_date!: Date;

    @Column({ type: "time" })
    hour!: string;

    @Column({
        type: "enum",
        enum: AppointmentStatus
    })
    status!: AppointmentStatus;

    @Column({ type: "int", nullable: true })
    service_id!: number;

    @ManyToOne(() => Service, service => service.appointments)
    @JoinColumn({ name: "service_id" })
    service!: Relation<Service>;

    @Column({ type: "int", nullable: true })
    client_id!: number;

    @ManyToOne(() => Client, client => client.appointments)
    @JoinColumn({ name: "client_id" })
    client!: Relation<Client>;

    @Column({ type: "int", nullable: true })
    worker_id!: number;

    @ManyToOne(() => Worker, worker => worker.appointments)
    @JoinColumn({ name: "worker_id" })
    worker!: Relation<Worker>;
}
