import { Router } from 'express';
import { UserController } from './user.controller.js';
import { authenticateJWT } from '../auth/auth.middleware.js';

const router = Router();
const userController = new UserController();

router.use(authenticateJWT);

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del usuario
 *         name:
 *           type: string
 *           description: Nombre del usuario
 *         email:
 *           type: string
 *           description: Correo electrónico (único)
 *         phone:
 *           type: string
 *           nullable: true
 *           description: Teléfono del usuario
 *         is_active:
 *           type: boolean
 *           description: Estado de la cuenta
 *         role:
 *           type: string
 *           enum: [Admin, Coordinator]
 *           description: Rol jerárquico del usuario
 *         center_id:
 *           type: integer
 *           nullable: true
 *           description: ID del centro asignado
 *     UserInput:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password_hash
 *         - role
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         password_hash:
 *           type: string
 *           description: Contraseña en texto plano a encriptar
 *         is_active:
 *           type: boolean
 *           default: true
 *         role:
 *           type: string
 *           enum: [Admin, Coordinator]
 *         center_id:
 *           type: integer
 *
 * /admin/users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     description: Retorna una lista de todos los usuarios del sistema sin sus contraseñas
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       500:
 *         description: Error del servidor
 */
router.get('/', (req, res) => userController.getAllUsers(req, res));

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     description: Retorna los datos de un usuario específico
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', (req, res) => userController.getUserById(req, res));

/**
 * @swagger
 * /admin/users:
 *   post:
 *     summary: Crear un nuevo usuario
 *     description: Crea un nuevo usuario (encriptando su contraseña) en el sistema
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post('/', (req, res) => userController.createUser(req, res));

/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     summary: Actualizar un usuario existente
 *     description: Actualiza un usuario. Si se envia la contraseña, esta será encriptada nuevamente.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', (req, res) => userController.updateUser(req, res));

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Eliminar un usuario
 *     description: Elimina físicamente un usuario de la base de datos
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       204:
 *         description: Usuario eliminado correctamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', (req, res) => userController.deleteUser(req, res));

export default router;
