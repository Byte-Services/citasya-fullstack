import { z } from "zod";
import { WorkerStatus } from "./worker.model.js";

// DTO para la creación de un trabajador
export const CreateWorkerDto = z.object({
    name: z.string({ required_error: "El nombre es requerido" }).min(1, "El nombre no puede estar vacío"),
    documentId: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    email: z.string().email("Formato de email inválido").optional().nullable(),
    schedule: z.record(z.any()).optional().nullable(),
    status: z.nativeEnum(WorkerStatus, { required_error: "El estado es requerido", invalid_type_error: "Estado inválido" }),
    notas: z.string().optional().nullable(),
    center_id: z.number().int().positive().optional().nullable(),
});

// DTO para la actualización de un trabajador
export const UpdateWorkerDto = CreateWorkerDto.partial();

// Tipos inferidos de Zod
export type CreateWorkerInput = z.infer<typeof CreateWorkerDto>;
export type UpdateWorkerInput = z.infer<typeof UpdateWorkerDto>;
