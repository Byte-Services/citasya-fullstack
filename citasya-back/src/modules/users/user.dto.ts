import { z } from "zod";
import { UserRole } from "./user.model.js";

// DTO para la creación de un usuario
export const CreateUserDto = z.object({
    name: z.string({ required_error: "El nombre es requerido" }).min(1, "El nombre no puede estar vacío"),
    email: z.string({ required_error: "El email es requerido" }).email("Formato de email inválido"),
    phone: z.string().optional(),
    password_hash: z.string({ required_error: "La contraseña es requerida" }).min(6, "La contraseña debe tener al menos 6 caracteres"),
    role: z.nativeEnum(UserRole, { required_error: "El rol es requerido", invalid_type_error: "Rol inválido" }),
    center_id: z.number().int().positive().optional(),
    is_active: z.boolean().optional().default(true),
});

// DTO para la actualización de un usuario (todos los campos son opcionales)
export const UpdateUserDto = CreateUserDto.partial();

// Aquí podemos exportar los tipos inferidos de Zod si los llegaramos a necesitar en los servicios
export type CreateUserInput = z.infer<typeof CreateUserDto>;
export type UpdateUserInput = z.infer<typeof UpdateUserDto>;
