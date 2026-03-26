import { AppDataSource } from "../../data-source.js";
import { BaseOrmService } from "../common/baseOrmService.js";
import { Worker } from "./worker.model.js";
import { CreateWorkerInput, UpdateWorkerInput } from "./worker.dto.js";

export class WorkerService extends BaseOrmService<Worker> {
    constructor() {
        super(AppDataSource.getRepository(Worker));
    }

    async findAllWorkers(): Promise<Worker[]> {
        return this.findAll({ relations: ['center', 'services'] });
    }

    async findWorkerById(id: number): Promise<Worker> {
        return this.findOneWithOptions({
            where: { id },
            relations: ['center', 'services']
        });
    }

    async createWorker(data: CreateWorkerInput): Promise<Worker> {
        return this.create(data);
    }

    async updateWorker(id: number, data: UpdateWorkerInput): Promise<Worker> {
        return this.update(id, data);
    }

    async deleteWorker(id: number) {
        return this.delete(id);
    }
}
