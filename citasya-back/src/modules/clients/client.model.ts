import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Relation } from "typeorm";
import { Center } from "../centers/center.model.js";
import { Appointment } from "../appointments/appointment.model.js";

/**
 * Entidad de TypeORM para la tabla 'Clients'.
 * Representa un modelo de datos para un cliente.
 */
@Entity("clients")
export class Client {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar" })
    name!: string;

    @Column({ type: "varchar", unique: true, nullable: true })
    documentId!: string;

    @Column({ type: "varchar", nullable: true })
    phone!: string;

    @Column({ type: "text", nullable: true })
    notes!: string;

    @Column({ type: "int", nullable: true })
    center_id!: number;

    @ManyToOne(() => Center, center => center.clients)
    center!: Relation<Center>;

    @OneToMany(() => Appointment, appointment => appointment.client)
    appointments!: Relation<Appointment[]>;
}
