// webhook.ts
import { Router, Request, Response } from "express";
import { sendWhatsAppMessage } from "./twilio/twilio.js";
import { createSpaAgent } from "./agent/agent.js";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { AppDataSource } from "./data-source.js";
import { AgentMessage } from "./modules/agent-messages/agent-message.model.js";
import { Client } from "./modules/clients/client.model.js";

const router = Router();
const agent = await createSpaAgent();

router.post("/webhook", async (req: Request, res: Response) => {
  const incomingMsg: string = req.body.Body;
  const sender: string = req.body.From.replace("whatsapp:+", "");
  let botResponse: string = "Lo siento, hubo un error procesando tu solicitud. Por favor, inténtalo de nuevo más tarde.";

  try {
    const clientRepo = AppDataSource.getRepository(Client);
    const agentMessageRepo = AppDataSource.getRepository(AgentMessage);

    // 1. Encontrar o crear el cliente
    let client = await clientRepo.findOne({ where: { phone: sender } });
    if (!client) {
      client = clientRepo.create({ phone: sender, name: sender });
      await clientRepo.save(client);
    }

    // 2. Cargar historial desde la DB
    const historyMessages = await agentMessageRepo.find({
      where: { client_id: client.id },
      order: { createdAt: "ASC" },
      take: 20, // Limita el historial para no sobrecargar el modelo
    });

    // 3. Construir el historial de mensajes para el agente
    const chatHistory = historyMessages.map(msg => {
      if (msg.role === "client") {
        return new HumanMessage(msg.message);
      } else {
        return new AIMessage(msg.message);
      }
    });

    // 4. Invocar al agente con el historial y el número de teléfono del remitente
    const response = await agent.invoke({
      input: incomingMsg,
      chat_history: chatHistory,
      sender_phone: sender, // El agente ahora maneja este campo internamente
    });

    botResponse = response.output;

    // 5. Guardar la conversación en la DB
    const newClientMessage = agentMessageRepo.create({
      message: incomingMsg,
      role: "client",
      client_id: client.id,
    });
    const newAgentMessage = agentMessageRepo.create({
      message: botResponse,
      role: "agent",
      client_id: client.id,
    });
    await agentMessageRepo.save([newClientMessage, newAgentMessage]);

    // 6. Enviar respuesta a WhatsApp
    await sendWhatsAppMessage(sender, botResponse);
    res.status(200).end();
  } catch (error: any) {
    console.error("❌ Error en webhook:", error);
    await sendWhatsAppMessage(sender, botResponse);
    res.status(500).send("Error interno del servidor");
  }
});

export default router;