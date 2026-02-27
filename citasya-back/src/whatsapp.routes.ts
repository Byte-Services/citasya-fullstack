import { Router, Request, Response } from 'express';
import { sendWhatsAppMessage } from './twilio/twilio.js';
import { createSpaAgent } from './agent/agent.js';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { AppDataSource } from './data-source.js'; // <--- Importa el origen de datos
// import { Message } from '../entities/Message.js'; // Descomenta si creaste esta entidad

const router = Router();

/**
 * @swagger
 * /whatsapp/webhook:
 *   post:
 *     summary: Webhook para recibir mensajes de WhatsApp
 *     description: Recibe mensajes entrantes de Twilio WhatsApp y responde usando el agente conversacional
 *     tags: [WhatsApp]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/WhatsAppWebhook'
 *     responses:
 *       200:
 *         description: Mensaje procesado correctamente
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/webhook', async (req: Request, res: Response) => {
    const incomingMsg: string = req.body.Body;
    const sender: string = req.body.From.replace('whatsapp:+', '');
    let botResponse: string = "Lo siento, hubo un error procesando tu solicitud. Por favor, inténtalo de nuevo más tarde.";

    try {
        console.log(`Mensaje entrante de ${sender}: "${incomingMsg}"`);
        
        // Reemplaza la lógica de la base de datos con TypeORM
        // const messageRepository = AppDataSource.getRepository(Message);
        
        // Insertar el mensaje entrante en la base de datos
        // const newMessage = messageRepository.create({
        //     telefono: sender,
        //     tipo_mensaje: 'entrante',
        //     contenido_mensaje: incomingMsg
        // });
        // await messageRepository.save(newMessage);

        // Recuperar el historial de mensajes (memoria del bot)
        // const historyMessages = await messageRepository.find({
        //     where: { telefono: sender },
        //     order: { timestamp: "DESC" },
        //     take: 10
        // });

        // const chatHistory: BaseMessage[] = historyMessages.reverse().map(row => {
        //     if (row.tipo_mensaje === 'entrante') {
        //         return new HumanMessage({ content: row.contenido_mensaje });
        //     } else {
        //         return new AIMessage({ content: row.contenido_mensaje });
        //     }
        // });
        
        // Código no implementado con TypeORM por falta de la entidad `Message`
        const chatHistory: BaseMessage[] = []; // Placeholder temporal
        
        const agent = await createSpaAgent(chatHistory);
        const response = await agent.call({ input: incomingMsg });
        botResponse = response.output;

        // Insertar la respuesta del bot en la base de datos
        // const newResponseMessage = messageRepository.create({
        //     telefono: sender,
        //     tipo_mensaje: 'saliente',
        //     contenido_mensaje: botResponse
        // });
        // await messageRepository.save(newResponseMessage);

        // Enviar la respuesta por WhatsApp
        await sendWhatsAppMessage(sender, botResponse);
        res.status(200).end();
    } catch (error: any) {
        console.error('Error en webhook:', error);
        await sendWhatsAppMessage(sender, botResponse);
        res.status(500).send('Error interno del servidor');
    }
});

export default router;