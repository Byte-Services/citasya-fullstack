import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Relation } from "typeorm";
import { User } from "../users/user.model.js";
import { Client } from "../clients/client.model.js";
import { Specialty } from "../specialties/specialty.model.js";
import { Worker } from "../workers/worker.model.js";

/**
 * Entidad de TypeORM para la tabla 'Center'.
 * Representa un modelo de datos para un centro.
 */
@Entity("center")
export class Center {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar" })
    name!: string;

    @Column({ type: "varchar", nullable: true })
    phone!: string;

    @Column({ type: "varchar", nullable: true })
    address!: string;

    @Column({ type: "jsonb", nullable: true })
    social_media!: object;

    @Column({ type: "jsonb", nullable: true })
    bussinesTime!: object;

    @Column({ type: "text", nullable: true })
    description!: string;

    @OneToMany(() => User, user => user.center)
    users!: Relation<User[]>;

    @OneToMany(() => Client, client => client.center)
    clients!: Relation<Client[]>;

    @OneToMany(() => Specialty, specialty => specialty.center)
    specialties!: Relation<Specialty[]>;

    @OneToMany(() => Worker, worker => worker.center)
    workers!: Relation<Worker[]>;
}
