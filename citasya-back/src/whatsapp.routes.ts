// src/api/whatsapp/whatsapp.routes.ts
import { Router, Request, Response } from 'express';
import { sendWhatsAppMessage } from './twilio/twilio.js';
import { createSpaAgent } from './agent/agent.js';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { AppDataSource } from './data-source.js';
import { AgentMessage } from './modules/agent-messages/agent-message.model.js';
import { Client } from './modules/clients/client.model.js';

const router = Router();

router.post('/webhook', async (req: Request, res: Response) => {
  const incomingMsg: string = req.body.Body;
  const sender: string = req.body.From.replace('whatsapp:+', '');
  let botResponse: string =
    'Lo siento, hubo un error procesando tu solicitud. Por favor, inténtalo de nuevo más tarde.';

  try {
    console.log(`📩 Mensaje entrante de ${sender}: "${incomingMsg}"`);

    const clientRepo = AppDataSource.getRepository(Client);
    const agentMessageRepo = AppDataSource.getRepository(AgentMessage);

    // 1. Buscar cliente por teléfono, si no existe lo creo
    let client = await clientRepo.findOne({ where: { phone: sender } });
    if (!client) {
      client = clientRepo.create({
        phone: sender,
        name: sender, // opcional: se podría reemplazar por nombre real si se captura después
      });
      await clientRepo.save(client);
    }

    // 2. Guardar mensaje entrante (cliente)
    const newClientMessage = agentMessageRepo.create({
      message: incomingMsg,
      role: 'client',
      client,
      client_id: client.id,
    });
    await agentMessageRepo.save(newClientMessage);

    // 3. Recuperar historial de últimos 10 mensajes de este cliente
    const historyMessages = await agentMessageRepo.find({
      where: { client_id: client.id },
      order: { createdAt: 'ASC' },
      take: 20,
    });

    const chatHistory: BaseMessage[] = historyMessages.map((row) => {
      if (row.role === 'client') {
        return new HumanMessage({ content: row.message });
      } else {
        return new AIMessage({ content: row.message });
      }
    });

    // 4. Crear agente con historial
    const agent = await createSpaAgent(chatHistory);
    const response = await agent.call({ input: incomingMsg });
    botResponse = response.output;

    // 5. Guardar respuesta del bot
    const newAgentMessage = agentMessageRepo.create({
      message: botResponse,
      role: 'agent',
      client,
      client_id: client.id,
    });
    await agentMessageRepo.save(newAgentMessage);

    // 6. Enviar respuesta por WhatsApp
    await sendWhatsAppMessage(sender, botResponse);

    res.status(200).end();
  } catch (error: any) {
    console.error('❌ Error en webhook:', error);
    await sendWhatsAppMessage(sender, botResponse);
    res.status(500).send('Error interno del servidor');
  }
});

export default router;
