import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from "typeorm";
import { Appointment } from "../appointments/appointment.model.js";
import { AgentMessage } from "../agent-messages/agent-message.model.js";

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

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;

    @OneToMany(() => Appointment, appointment => appointment.client)
    appointments!: Appointment[];

    @OneToMany(() => AgentMessage, msg => msg.client)
    messages!: AgentMessage[];
}
