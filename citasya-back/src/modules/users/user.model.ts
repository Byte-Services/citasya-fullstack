import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from "typeorm";
import { Center } from "../centers/center.model.js";

export enum UserRole {
    Admin = "Admin",
    Coordinator = "Coordinator"
}

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar" })
    name!: string;

    @Column({ type: "varchar", unique: true })
    email!: string;

    @Column({ type: "varchar", nullable: true })
    phone!: string;

    @Column({ type: "varchar" })
    password_hash!: string;

    @Column({ type: "boolean", default: true })
    is_active!: boolean;

    @Column({
        type: "enum",
        enum: UserRole
    })
    role!: UserRole;

    @Column({ type: "int", nullable: true })
    center_id!: number;

    @ManyToOne(() => Center, (center: Center) => center.users)
    center!: Relation<Center>;
}
