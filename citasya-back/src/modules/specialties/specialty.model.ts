import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Service } from "../services/service.model.js";

/**
 * Entidad de TypeORM para la tabla 'Specialties'.
 * Representa el modelo de datos para una especialidad en la base de datos.
 */
@Entity("specialties")
export class Specialty {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar" })
    name!: string;

    @OneToMany(() => Service, (service: Service) => service.specialty)
    services!: Service[];
}
