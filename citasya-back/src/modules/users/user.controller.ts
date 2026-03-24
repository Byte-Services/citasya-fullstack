import { Request, Response } from 'express';
import { UserService } from './user.services.js';
import { CreateUserDto, UpdateUserDto } from './user.dto.js';
import { z } from 'zod';

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    /**
     * @route GET /admin/users
     * @desc Obtiene una lista de todos los usuarios.
     */
    public async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const users = await this.userService.findAllUsers();
            res.status(200).json(users);
        } catch (error) {
            console.error("Error fetching users:", error);
            res.status(500).json({ message: "Error al obtener los usuarios." });
        }
    }

    /**
     * @route GET /admin/users/:id
     * @desc Obtiene un usuario por su ID.
     */
    public async getUserById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const user = await this.userService.findUserById(Number(id));

            if (!user) {
                res.status(404).json({ message: "Usuario no encontrado." });
                return;
            }

            res.status(200).json(user);
        } catch (error) {
            console.error(`Error fetching user with id ${req.params.id}:`, error);
            res.status(500).json({ message: "Error al obtener el usuario." });
        }
    }

    /**
     * @route POST /admin/users
     * @desc Crea un nuevo usuario resguardando la contraseña.
     */
    public async createUser(req: Request, res: Response): Promise<void> {
        try {
            // Validamos los datos de entrada con Zod
            const userData = CreateUserDto.parse(req.body);
            
            const newUser = await this.userService.createUser(userData);
            res.status(201).json(newUser);
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ message: "Datos inválidos", errors: error.errors });
                return;
            }
            console.error("Error creating user:", error);
            res.status(500).json({ message: "Error al crear el usuario." });
        }
    }

    /**
     * @route PUT /admin/users/:id
     * @desc Actualiza un usuario existente.
     */
    public async updateUser(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            
            // Validamos los datos de entrada con Zod (partial)
            const userData = UpdateUserDto.parse(req.body);
            
            const updatedUser = await this.userService.updateUser(Number(id), userData);

            if (!updatedUser) {
                res.status(404).json({ message: "Usuario no encontrado." });
                return;
            }

            res.status(200).json(updatedUser);
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ message: "Datos inválidos", errors: error.errors });
                return;
            }
            console.error(`Error updating user with id ${req.params.id}:`, error);
            res.status(500).json({ message: "Error al actualizar el usuario." });
        }
    }

    /**
     * @route DELETE /admin/users/:id
     * @desc Elimina un usuario.
     */
    public async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const result = await this.userService.deleteUser(Number(id));

            if (!result) {
                res.status(404).json({ message: "Usuario no encontrado." });
                return;
            }

            res.status(204).send(); // 204 No Content para borrado exitoso
        } catch (error) {
            console.error(`Error deleting user with id ${req.params.id}:`, error);
            res.status(500).json({ message: "Error al eliminar el usuario." });
        }
    }
}
