import {Entity,PrimaryGeneratedColumn,Column,ManyToOne,OneToMany,JoinTable,ManyToMany,Relation} from "typeorm";
import { Center } from "../centers/center.model.js";
import { Appointment } from "../appointments/appointment.model.js";
import { Service } from "../services/service.model.js";

/**
 * Enumeración para el estado de un trabajador.
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

    @Column({ type: "text", nullable: true })
    notas!: string;

    @Column({ type: "int", nullable: true })
    center_id!: number;

    @ManyToOne(() => Center, (center: Center) => center.workers)
    center!: Relation<Center>;

    @OneToMany(() => Appointment, (appointment: Appointment) => appointment.worker)
    appointments!: Relation<Appointment[]>;

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
    services!: Relation<Service[]>;
}
