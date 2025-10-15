import { AppDataSource } from "../../data-source.js";
import { User, UserRole } from "./user.model.js";
import bcrypt from "bcryptjs";

const userRepository = AppDataSource.getRepository(User);

export const createUserService = async (data: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
}) => {
  const existingUser = await userRepository.findOneBy({ email: data.email });
  if (existingUser) {
    throw new Error("El correo ya está registrado");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newUser = userRepository.create({
    name: data.name,
    email: data.email,
    phone: data.phone ?? undefined,
    password_hash: hashedPassword,
    role: data.role,
    is_active: true,
  });

  await userRepository.save(newUser);

  return newUser;
};
