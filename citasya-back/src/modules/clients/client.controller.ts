import { Request, Response } from 'express';
import { ClientService } from './client.service.js';

// Instancia directa del servicio
const clientService = new ClientService();

/**
 * Controlador para las rutas relacionadas con clientes.
 * Gestiona las operaciones CRUD para los clientes.
 */
export class ClientController {
    /**
     * Obtiene una lista de todos los clientes.
     * @return JSON con los clientes encontrados.
     */
    async getAllClients(req: Request, res: Response): Promise<void> {
        try {
            const clients = await clientService.findAllClients();
            res.status(200).json(clients);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener los clientes." });
        }
    }

    /**
     * Busca un cliente por su ID, incluyendo su historial de citas.
     * @return JSON con el cliente encontrado o mensaje de error.
     */
    async getClientById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const client = await clientService.findClientById(Number(id));

            if (!client) {
                res.status(404).json({ message: "Cliente no encontrado." });
                return;
            }

            // Aquí agregar la lógica para calcular el total invertido

            res.status(200).json(client);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener el perfil del cliente." });
        }
    }

    async getClientByDocumentId(req: Request, res: Response): Promise<void> {
        try {
            const { documentId } = req.params;
            const client = await clientService.findClientByDocumentId(documentId);

            if (!client) {
                res.status(404).json(null);
                return;
            }
            res.status(200).json(client);
        } catch (error) {
            res.status(500).json({ message: "Error al buscar el cliente." });
        }
    }

    /**
     * Crea un nuevo cliente.
     * @return JSON con el cliente creado o mensaje de error.
     */
    async createClient(req: Request, res: Response): Promise<void> {
        try {
            const clientData = req.body;
            const newClient = await clientService.createClient(clientData);
            res.status(201).json(newClient);
        } catch (error) {
            res.status(500).json({ message: "Error al crear el cliente." });
        }
    }

    /**
     * Actualiza los datos de un cliente existente.
     * @return JSON con el cliente actualizado o mensaje de error.
     */
    async updateClient(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const clientData = req.body;
            const updatedClient = await clientService.updateClient(Number(id), clientData);

            if (!updatedClient) {
                res.status(404).json({ message: "Cliente no encontrado." });
                return;
            }

            res.status(200).json(updatedClient);
        } catch (error) {
            res.status(500).json({ message: "Error al actualizar el cliente." });
        }
    }

    /**
     * Elimina un cliente por su ID.
     * @return Respuesta vacía si se elimina o mensaje de error.
     */
    async deleteClient(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const result = await clientService.deleteClient(Number(id));

            if (!result.success) {
                if (result.reason === "Cliente no encontrado") {
                    res.status(404).json({ message: "Cliente no encontrado." });
                } else {
                    res.status(400).json({ message: "No se puede eliminar el cliente porque tiene citas pendientes o confirmadas." });
                }
                return;
            }

            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: "Error al eliminar el cliente." });
        }
    }

}