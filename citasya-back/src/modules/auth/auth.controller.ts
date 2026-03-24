import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    /**
     * @route POST /auth/login
     * @desc Iniciar sesión y obtener token JWT
     */
    public async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({ message: "Email y contraseña son requeridos." });
                return;
            }

            const result = await this.authService.login(email, password);
            
            res.status(200).json({
                message: "Inicio de sesión exitoso",
                token: result.token,
                user: result.user
            });
        } catch (error: any) {
            console.error("Error validando credenciales:", error);
            
            if (error.message === 'Usuario no encontrado' || error.message === 'Contraseña inválida') {
                res.status(401).json({ message: "Credenciales inválidas." });
                return;
            }

            res.status(500).json({ message: "Error interno del servidor." });
        }
    }
}
