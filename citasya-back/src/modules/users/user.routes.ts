import { Router } from 'express';
import { UserController } from './user.controller.js';

const router = Router();
const userController = new UserController();

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     description: Retorna una lista de todos los usuarios del sistema sin sus contraseñas
 *     tags: [Users]
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
