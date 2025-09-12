import "reflect-metadata";
import { DataSource } from "typeorm";
import { Appointment } from "./modules/appointments/appointment.model.js";
import { Client } from "./modules/clients/client.model.js";
import { Service } from "./modules/services/service.model.js";
import { Specialty } from "./modules/specialties/specialty.model.js";
import { User } from "./modules/users/user.model.js";
import { Worker } from "./modules/workers/worker.model.js";
import { AgentMessage } from "./modules/agent-messages/agent-message.model.js";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [User, Specialty, Client, Worker, Service, Appointment, AgentMessage],
    migrations: [],
    subscribers: [],
});