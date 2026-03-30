import twilio from 'twilio';

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