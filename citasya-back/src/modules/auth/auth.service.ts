import { AppDataSource } from "../../data-source.js";
import { User } from "../users/user.model.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService {
    private userRepository = AppDataSource.getRepository(User);

    public async login(email: string, password: string): Promise<{ user: Omit<User, 'password_hash'>, token: string }> {
        const user = await this.userRepository.findOne({ where: { email } });

        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            throw new Error('Contraseña inválida');
        }

        const { password_hash, ...userWithoutPassword } = user;
        
        const payload = { sub: user.id, email: user.email, role: user.role };
        const secret = process.env.JWT_SECRET || 'supersecret';
        const expiresIn = process.env.JWT_EXPIRES_IN || '8h';

        const token = jwt.sign(payload, secret, { expiresIn: expiresIn as any });

        return { user: userWithoutPassword, token };
    }
}
