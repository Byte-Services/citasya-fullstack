import twilio from 'twilio';
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";

const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

export async function sendWhatsAppMessage(sender: string, message: string): Promise<void> {
  try {
    await client.messages.create({
      from: 'whatsapp:' + process.env.TWILIO_PHONE_NUMBER!,
      body: message,
      to: `whatsapp:+${sender}`
    });
    console.log('Mensaje enviado a:', sender);
  } catch (error: any) {
    console.error('Error enviando mensaje:', error);
    if (error.status) {
        console.error(`Código de error Twilio: ${error.status}`);
    }
    throw error;
  }
}

// export async function getChatHistory(sender: string): Promise<any[]> {
//   const messages = await client.messages.list({
//       from: `whatsapp:+${sender}`,
//       to: 'whatsapp:' + process.env.TWILIO_PHONE_NUMBER!,
//       limit: 10,
//   });
//   return messages;
// }

export async function getChatHistory(sender: string): Promise<BaseMessage[]> {
  const userWhatsApp = `whatsapp:+${sender}`;
  const twilioWhatsApp = 'whatsapp:' + process.env.TWILIO_PHONE_NUMBER!;

  const [inboundMessages, outboundMessages] = await Promise.all([
    client.messages.list({
      from: userWhatsApp,
      to: twilioWhatsApp,
      limit: 10,
    }),
    client.messages.list({
      from: twilioWhatsApp,
      to: userWhatsApp,
      limit: 10,
    })
  ]);

  const allMessages = [...inboundMessages, ...outboundMessages];

  allMessages.sort((a, b) => b.dateCreated.getTime() - a.dateCreated.getTime());

  const historialParaLangchain = allMessages.slice(0, 10).reverse().map(msg => {
      // Si direction es "inbound", es el usuario mandando mensaje a tu bot
      if (msg.direction === 'inbound') {
          return new HumanMessage(msg.body);
      } 
      // Si no, es "outbound-api" o similar, o sea, tu bot respondiendo
      else {
          return new AIMessage(msg.body);
      }
  });

  console.log('Historial formateado para Langchain:', historialParaLangchain);

  return historialParaLangchain;
}