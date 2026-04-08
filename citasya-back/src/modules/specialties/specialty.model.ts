import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Relation } from "typeorm";
import { Center } from "../centers/center.model.js"; 
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
    
    @Column({ type: "text", nullable: true })
    description!: string;

    @Column({ type: "int", nullable: true })
    center_id!: number;

    @ManyToOne(() => Center, (center: Center) => center.specialties)
    center!: Relation<Center>;

    @OneToMany(() => Service, (service: Service) => service.specialty)
    services!: Relation<Service[]>;
}
