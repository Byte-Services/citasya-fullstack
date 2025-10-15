import { Request, Response } from "express";
import { User, UserRole } from "./user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../../data-source.js";
import { createUserService } from "./user.service.js";


const userRepository = AppDataSource.getRepository(User);

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await userRepository.findOneBy({ email });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Generar token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "8h" }
    );

    return res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Error en login", error });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ message: "Rol inválido" });
    }

    const newUser = await createUserService({ name, email, phone, password, role });

    return res.status(201).json({ message: "Usuario creado correctamente", user: newUser });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Error al crear usuario" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role } = req.body;

    const user = await userRepository.findOneBy({ id: Number(id) });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    user.name = name;
    user.email = email;
    user.phone = phone;
    user.role = role;

    await userRepository.save(user);

    return res.json({ message: "Usuario actualizado correctamente", user });
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar usuario", error });
  }
};
