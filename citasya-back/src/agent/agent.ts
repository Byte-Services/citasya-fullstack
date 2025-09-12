import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { ChatOpenAI } from "@langchain/openai";
import {
    bookAppointmentTool,
    listServicesTool,
    checkServiceAvailabilityTool,
    listUserAppointmentsTool,
    cancelAppointmentTool,
    getServiceDetailsTool,
    findClientByPhoneTool, 
    createClientTool,
    listSpecialtiesTool,
    listServicesBySpecialtyTool,
    getAvailableSlotsTool,       
} from './tools.js';
import { BufferMemory } from "langchain/memory";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { BaseMessage } from "@langchain/core/messages";


export async function createSpaAgent(chatHistory?: BaseMessage[]) {    
    const model = new ChatOpenAI({
        temperature: 0,
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: "gpt-3.5-turbo"
    });

    // Array de herramientas disponibles para el agente
    const tools = [
    listSpecialtiesTool,
    listServicesBySpecialtyTool,
    listServicesTool,
    getServiceDetailsTool,
    getAvailableSlotsTool,          
    checkServiceAvailabilityTool,
    bookAppointmentTool,
    listUserAppointmentsTool,
    cancelAppointmentTool,
    findClientByPhoneTool,
    createClientTool,
    ];

    // Si hay historial, se carga en memoria
    const memory = new BufferMemory({
        chatHistory: new ChatMessageHistory(chatHistory || []),
        returnMessages: true,
        memoryKey: "chat_history"
    });

    // agent/agent.ts (fragmento relevante dentro de createSpaAgent)
    return await initializeAgentExecutorWithOptions(tools, model, {
        agentType: "openai-functions",
        verbose: true,
        agentArgs: {
            prefix: `Eres 'Luna', asistente virtual de Spa Caracas. Respondes en español.
        Tu objetivo: ayudar a clientes a conocer servicios, precios y agendar/cancelar/consultar citas.

        Reglas operativas IMPORTANTES:
        - Horario del centro (America/Caracas):
        • L-V: 08:00-18:00
        • S-D: 09:00-16:00
        - Siempre respeta ese horario al ofrecer opciones.
        - La disponibilidad se basa en: duración del servicio, citas existentes del especialista y horario del centro.
        - Cuando el cliente quiera agendar: sugiere hasta 5 opciones usando "check_service_availability".
        - Al reservar, calcula hora fin según la duración del servicio. Usa "book_appointment" con worker_id cuando el cliente elija una opción.

        Flujo de conversación:
        1) Si el cliente habla de categorías (ej. "Manicure", "Peluquería"), usa "list_services_by_specialty".
        Si no conoce categorías, usa "list_specialties" y luego "list_services_by_specialty".
        2) Si menciona un servicio específico: usa "get_service_details" y PREGUNTA fecha (YYYY-MM-DD).
        3) Cuando tenga servicio + fecha: usa "check_service_availability" para sugerir 3-5 opciones con hora y especialista.
        4) El cliente elige una opción (incluye Worker ID y hora). Verifica con "check_service_availability" si quieres confirmar.
        5) Identifica cliente con "find_client_by_phone". Si no existe, pide nombre completo, cédula y fecha de nacimiento y crea con "create_client".
        6) Reserva usando "book_appointment" (incluye worker_id si el cliente eligió una opción con especialista).
        7) Confirma con un resumen: servicio, especialista, fecha, hora inicio-fin, precio.

        Cancelar cita:
        - Si el cliente pide cancelar, primero usa "list_user_appointments" (por su teléfono), pide el ID a cancelar y luego usa "cancel_appointment".

        Consultas de precios/detalles:
        - Usa "get_service_details".

        Tono: claro, amable y profesional.
        `
        },
        memory
    });

}
