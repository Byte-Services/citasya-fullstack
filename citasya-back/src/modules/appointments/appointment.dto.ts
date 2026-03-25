import { z } from "zod";
import { AppointmentStatus } from "./appointment.model.js";

// DTO para la creación de una cita
export const CreateAppointmentDto = z.object({
    date: z.coerce.date({ required_error: "La fecha es requerida", invalid_type_error: "Formato de fecha inválido" }),
    end_date: z.coerce.date().optional().nullable(),
    hour: z.string({ required_error: "La hora es requerida" }).regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, "Formato de hora inválido (HH:mm)"),
    status: z.nativeEnum(AppointmentStatus, { required_error: "El estado es requerido", invalid_type_error: "Estado inválido" }),
    service_id: z.number().int().positive().optional().nullable(),
    client_id: z.number().int().positive().optional().nullable(),
    worker_id: z.number().int().positive().optional().nullable(),
});

// DTO para la actualización de una cita
export const UpdateAppointmentDto = CreateAppointmentDto.partial();

// Tipos inferidos de Zod
export type CreateAppointmentInput = z.infer<typeof CreateAppointmentDto>;
export type UpdateAppointmentInput = z.infer<typeof UpdateAppointmentDto>;
