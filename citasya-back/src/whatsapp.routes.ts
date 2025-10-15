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
  let botResponse: string =
    "Lo siento, hubo un error procesando tu solicitud. Por favor, inténtalo de nuevo más tarde.";

  try {
    const clientRepo = AppDataSource.getRepository(Client);
    const agentMessageRepo = AppDataSource.getRepository(AgentMessage);

    // Buscar cliente existente
    const client = await clientRepo.findOne({ where: { phone: sender } });

    // Cargar historial si existe cliente
    const historyMessages = client
      ? await agentMessageRepo.find({
          where: { client_id: client.id },
          order: { createdAt: "ASC" },
          take: 20,
        })
      : [];

    const chatHistory = historyMessages.map((msg) =>
      msg.role === "client"
        ? new HumanMessage(msg.message)
        : new AIMessage(msg.message)
    );

    // Invocar al agente
    const response = await agent.invoke({
      input: incomingMsg,
      chat_history: chatHistory,
      sender_phone: sender,
    });

    botResponse = response.output;

    const bookingKeywords = [
      "Cita agendada",
      "Tu cita ha sido confirmada",
      "Reserva completada",
      "Tu cita para el servicio de",
    ];

    const confirmedBooking = bookingKeywords.some((kw) =>
      botResponse.toLowerCase().includes(kw.toLowerCase())
    );

    if (confirmedBooking && client) {
      await agentMessageRepo.delete({ client_id: client.id });
    }

    // Guardar mensajes (si existe cliente)
    if (client) {
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
    }

    // Enviar respuesta a WhatsApp
    await sendWhatsAppMessage(sender, botResponse);
    res.status(200).end();
  } catch (error: any) {
    await sendWhatsAppMessage(sender, botResponse);
    res.status(500).send("Error interno del servidor");
  }
});

export default router;
