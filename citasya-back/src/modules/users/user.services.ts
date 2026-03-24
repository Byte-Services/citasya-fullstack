import { AppDataSource } from "../../data-source.js";
import { User } from "./user.model.js";
import bcrypt from "bcryptjs";

export class UserService {
    private userRepository = AppDataSource.getRepository(User);

    /**
     * Obtiene todos los usuarios, omitiendo la contraseña.
     */
    public async findAllUsers(): Promise<User[]> {
        return this.userRepository.find({
            select: ["id", "name", "email", "phone", "is_active", "role", "center_id"]
        });
    }

    /**
     * Busca un usuario por ID, omitiendo la contraseña.
     */
    public async findUserById(id: number): Promise<User | null> {
        return this.userRepository.findOne({
            where: { id },
            select: ["id", "name", "email", "phone", "is_active", "role", "center_id"]
        });
    }

    /**
     * Crea un nuevo usuario en la base de datos hasheando la contraseña antes de guardarlo.
     */
    public async createUser(userData: Partial<User>): Promise<Omit<User, 'password_hash'>> {
        if (userData.password_hash) {
            const salt = await bcrypt.genSalt(10);
            userData.password_hash = await bcrypt.hash(userData.password_hash, salt);
        }
        
        const newUser = this.userRepository.create(userData);
        const savedUser = await this.userRepository.save(newUser);
        
        const { password_hash, ...userWithoutPassword } = savedUser;
        return userWithoutPassword as unknown as Omit<User, 'password_hash'>;
    }

    /**
     * Actualiza un usuario existente, comprobando si actualizó su contraseña.
     */
    public async updateUser(id: number, userData: Partial<User>): Promise<Omit<User, 'password_hash'> | null> {
        const user = await this.userRepository.findOneBy({ id });
        if (!user) {
            return null;
        }

        if (userData.password_hash) {
            const salt = await bcrypt.genSalt(10);
            userData.password_hash = await bcrypt.hash(userData.password_hash, salt);
        }

        this.userRepository.merge(user, userData);
        const updatedUser = await this.userRepository.save(user);

        const { password_hash, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword as unknown as Omit<User, 'password_hash'>;
    }

    /**
     * Elimina un usuario.
     */
    public async deleteUser(id: number): Promise<boolean> {
        const result = await this.userRepository.delete(id);
        return result.affected !== 0 && result.affected !== null;
    }
}
