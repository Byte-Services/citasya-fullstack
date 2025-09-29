// agent/tools.ts
import { DynamicStructuredTool } from 'langchain/tools';
import { z } from 'zod';
import { google } from 'googleapis';
import { AppDataSource } from '../data-source.js';
import { Service, ServiceStatus } from '../modules/services/service.model.js';
import { Client } from '../modules/clients/client.model.js';
import { Appointment, AppointmentStatus } from '../modules/appointments/appointment.model.js';
import { Worker, WorkerStatus } from '../modules/workers/worker.model.js';
import { Specialty } from '../modules/specialties/specialty.model.js';
import { MoreThanOrEqual, Not, In } from 'typeorm';

// ---------------- Google Calendar ----------------
const SERVICE_ACCOUNT_KEY_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || './service_account_key.json';
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_KEY_PATH,
  scopes: ['https://www.googleapis.com/auth/calendar'],
});
const calendar = google.calendar({ version: 'v3', auth });

// ---------------- Utilidades de tiempo ----------------

// Horario estándar del centro (America/Caracas)
type DayIdx = 0|1|2|3|4|5|6; // 0=Dom, 6=Sáb
const CENTER_HOURS: Record<DayIdx, { open: string; close: string }> = {
  0: { open: '09:00', close: '16:00' }, // Domingo
  1: { open: '08:00', close: '18:00' }, // Lunes
  2: { open: '08:00', close: '18:00' }, // Martes
  3: { open: '08:00', close: '18:00' }, // Miércoles
  4: { open: '08:00', close: '18:00' }, // Jueves
  5: { open: '08:00', close: '18:00' }, // Viernes
  6: { open: '09:00', close: '16:00' }, // Sábado
};

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}
function toHHMM(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
function addMinutes(hhmm: string, delta: number): string {
  return toHHMM(toMinutes(hhmm) + delta);
}
function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  const aS = toMinutes(aStart), aE = toMinutes(aEnd), bS = toMinutes(bStart), bE = toMinutes(bEnd);
  return aS < bE && bS < aE;
}
function getCenterWindow(date: Date): { start: string; end: string } {
  const dow = date.getUTCDay(); // ¡OJO! date aquí es local. Para evitar confusión, usamos getDay():
  const localDow = date.getDay() as DayIdx;
  const cfg = CENTER_HOURS[localDow];
  return { start: cfg.open, end: cfg.close };
}

// Genera slots alineados cada 15 minutos dentro del rango [start, end] que quepan con una duración dada
function generateCandidateSlots(rangeStart: string, rangeEnd: string, serviceMins: number, stepMins = 15): string[] {
  const out: string[] = [];
  let t = toMinutes(rangeStart);
  const end = toMinutes(rangeEnd);
  while (t + serviceMins <= end) {
    out.push(toHHMM(t));
    t += stepMins;
  }
  return out;
}

// Normaliza una fecha dada en varios formatos a YYYY-MM-DD, asumiendo el año actual o el siguiente si ya pasó
function normalizeDate(fecha: string): string {
    const today = new Date();
    const currentYear = today.getFullYear();
    let year = currentYear;
    let month: number;
    let day: number;

    // Si la fecha contiene '-', asumimos formato 'YYYY-MM-DD'
    if (fecha.includes('-')) {
        const parts = fecha.split('-');
        if (parts.length === 3) {
            year = parseInt(parts[0], 10);
            month = parseInt(parts[1], 10);
            day = parseInt(parts[2], 10);
        } else {
            // Manejar 'MM-DD' si el LLM lo envía así
            month = parseInt(parts[0], 10);
            day = parseInt(parts[1], 10);
        }
    } else if (fecha.includes('/')) {
        // Si la fecha contiene '/', asumimos 'DD/MM'
        const parts = fecha.split('/');
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
    } else {
        // Si no, asumimos que es un día del mes actual
        day = parseInt(fecha, 10);
        month = today.getMonth() + 1;
    }

    // Crea un objeto de fecha con el año actual
    let dateObj = new Date(currentYear, month - 1, day);

    // Compara la fecha creada con la fecha actual.
    // Si la fecha ya pasó en el año actual, usa el próximo año.
    if (dateObj < today) {
        dateObj.setFullYear(currentYear + 1);
    }

    // Formatea la fecha al formato YYYY-MM-DD
    const formattedMonth = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const formattedDay = dateObj.getDate().toString().padStart(2, '0');

    return `${dateObj.getFullYear()}-${formattedMonth}-${formattedDay}`;
}


// ---------------- Helpers de datos ----------------
async function getServiceByName(name: string): Promise<Service | null> {
  const repo = AppDataSource.getRepository(Service);
  return await repo.findOne({
    where: { name },
    relations: ['specialty'],
  });
}

async function getWorkersForService(serviceId: number): Promise<Worker[]> {
  const workerRepo = AppDataSource.getRepository(Worker);
  // workers que ofrecen ese servicio y están activos
  const workers = await workerRepo
    .createQueryBuilder('worker')
    .leftJoinAndSelect('worker.services', 'service')
    .where('service.id = :serviceId', { serviceId })
    .andWhere('worker.status = :status', { status: WorkerStatus.Activo })
    .getMany();
  return workers;
}

async function getAppointmentsForWorkersOnDate(workerIds: number[], date: Date) {
  const apptRepo = AppDataSource.getRepository(Appointment);
  // normalizamos fecha a 00:00:00
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);

  const apps = await apptRepo.find({
    where: {
      worker_id: In(workerIds),
      date: day,
      status: Not(AppointmentStatus.Cancelado)
    },
    order: { hour: 'ASC' }
  });
  return apps;
}

// Intersecta el horario del centro con la agenda del worker,
// y sustrae bloques ocupados por citas para producir slots disponibles
function computeWorkerFreeSlotsForDay(
  serviceDuration: number,
  date: Date,
  workerSchedule: any | null,
  existingAppointments: Appointment[],
): { start: string; end: string }[] {
  const localDow = date.getDay() as DayIdx;
  const centerHours = getCenterWindow(date);
  let baseStart = centerHours.start;
  let baseEnd = centerHours.end;

  if (workerSchedule && workerSchedule.days) {
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][localDow];
    const workerDaySchedule = workerSchedule.days[dayOfWeek];

    if (!workerDaySchedule || !workerDaySchedule.enabled) {
      return [];
    }

    const workerStart = workerDaySchedule.startTime;
    const workerEnd = workerDaySchedule.endTime;

    const startMinutes = Math.max(toMinutes(baseStart), toMinutes(workerStart));
    const endMinutes = Math.min(toMinutes(baseEnd), toMinutes(workerEnd));

    if (startMinutes >= endMinutes) {
      return [];
    }

    baseStart = toHHMM(startMinutes);
    baseEnd = toHHMM(endMinutes);
  }

  const busy: { start: string; end: string }[] = existingAppointments.map(a => ({
    start: a.hour,
    end: a.end_time ?? addMinutes(a.hour, 60)
  }));

  if (workerSchedule && workerSchedule.breakTime) {
    const breakStart = workerSchedule.breakTime;
    const breakEnd = addMinutes(breakStart, 60);
    if (rangesOverlap(baseStart, baseEnd, breakStart, breakEnd)) {
      busy.push({ start: breakStart, end: breakEnd });
    }
  }

  const candidates = generateCandidateSlots(baseStart, baseEnd, serviceDuration, 15);

  const result: { start: string; end: string }[] = [];
  for (const start of candidates) {
    const end = addMinutes(start, serviceDuration);
    const overlaps = busy.some(b => rangesOverlap(start, end, b.start, b.end));
    if (!overlaps) {
      result.push({ start, end });
    }
  }
  return result;
}

// ---------------- TOOLS ----------------

// Buscar cliente por teléfono
export const findClientByPhoneTool = new DynamicStructuredTool({
  name: "find_client_by_phone",
  description: "Busca un cliente por su número de teléfono. Usa sender_phone.",
  schema: z.object({ telefono: z.string().describe("Número de teléfono del cliente, siempre usar sender_phone") }),
  func: async ({ telefono }) => {
    const clientRepository = AppDataSource.getRepository(Client);
    const client = await clientRepository.findOne({ where: { phone: telefono } });
    if (client) {
      return JSON.stringify({ encontrado: true, id: client.id, nombre: client.name, telefono: client.phone });
    }
    return JSON.stringify({ encontrado: false });
  }
});

// Crear cliente nuevo
export const createClientTool = new DynamicStructuredTool({
  name: "create_client",
  description: "Crea un cliente nuevo en la base de datos.",
  schema: z.object({
    nombre_completo: z.string().describe("Nombre completo del cliente"),
    cedula: z.string().describe("Cédula o documento de identidad del cliente"),
    telefono: z.string().describe("Número de teléfono del cliente, siempre usar sender_phone"),
  }),
  func: async ({ nombre_completo, cedula, telefono }) => {
    try {
      const repo = AppDataSource.getRepository(Client);
      const newClient = repo.create({ name: nombre_completo, documentId: cedula, phone: telefono });
      await repo.save(newClient);
      return JSON.stringify({ creado: true, id: newClient.id, nombre: newClient.name });
    } catch (e) {
      return JSON.stringify({ creado: false, error: "No se pudo crear el cliente (posible documento duplicado)." });
    }
  }
});


// Listar TODAS las especialidades — NUEVO
export const listSpecialtiesTool = new DynamicStructuredTool({
  name: "list_specialties",
  description: "Lista las categorías o especialidades de servicios disponibles.",
  schema: z.object({}),
  func: async () => {
    const repo = AppDataSource.getRepository(Specialty);
    const all = await repo.find({ order: { name: 'ASC' } });
    if (!all.length) return "No hay categorías disponibles.";
    return "Categorías:\n" + all.map((s, i) => `${i + 1}. ${s.name}`).join('\n');
  }
});

// Listar servicios por especialidad
export const listServicesBySpecialtyTool = new DynamicStructuredTool({
  name: "list_services_by_specialty",
  description: "Lista servicios activos de una especialidad (categoría).",
  schema: z.object({ especialidad: z.string().describe("Nombre de la especialidad, p.ej. 'Peluquería'") }),
  func: async ({ especialidad }) => {
    const repo = AppDataSource.getRepository(Service);
    const services = await repo.find({
      where: { status: ServiceStatus.Activo },
      relations: ['specialty']
    });
    const filtered = services.filter(s => s.specialty?.name?.toLowerCase() === especialidad.toLowerCase());
    if (!filtered.length) return `No hay servicios activos en '${especialidad}'.`;
    return `Servicios en ${especialidad}:\n` + filtered.map((s, i) => `${i + 1}. ${s.name} - ${s.price} USD`).join('\n');
  }
});

// Listar todos los servicios activos
export const listServicesTool = new DynamicStructuredTool({
  name: "list_services",
  description: "Lista todos los servicios activos del spa.",
  schema: z.object({}),
  func: async () => {
    const serviceRepository = AppDataSource.getRepository(Service);
    const activeServices = await serviceRepository.find({
      where: { status: ServiceStatus.Activo },
      order: { name: "ASC" }
    });
    if (!activeServices.length) return "No hay servicios disponibles.";
    const serviceList = activeServices.map((s, i) => `${i + 1}. ${s.name}`).join('\n');
    return `Servicios disponibles:\n${serviceList}`;
  }
});

// Detalles de un servicio
export const getServiceDetailsTool = new DynamicStructuredTool({
  name: "get_service_details",
  description: "Obtiene la descripción, precio y duración de un servicio específico.",
  schema: z.object({ servicio: z.string() }),
  func: async ({ servicio }) => {
    const serviceRepository = AppDataSource.getRepository(Service);
    const service = await serviceRepository.findOne({ where: { name: servicio } });
    if (!service) return `No encontré el servicio '${servicio}'.`;
    return `Servicio '${service.name}': ${service.description || 'Sin descripción'} | Precio: ${service.price} USD | Duración: ${service.minutes_duration} minutos.`;
  }
});

// Obtener horarios disponibles para un servicio y una fecha
// Obtener horarios disponibles para un servicio y una fecha
export const getAvailableSlotsTool = new DynamicStructuredTool({
  name: "get_available_slots",
  description: `Devuelve opciones de horarios disponibles para un servicio en una fecha dada. 
    El formato correcto es YYYY-MM-DD. 
    - Si el cliente no menciona el año, usa siempre el año actual (${new Date().getFullYear()}). 
    - Si el cliente no menciona el mes, usa siempre el mes en curso (${new Date().getMonth() + 1}). 
    Nunca inventes otro año o mes.
    IMPORTANTE: La herramienta devuelve la respuesta en formato de texto. El agente debe parsear este texto para extraer el worker_id del especialista y el horario al hacer la reserva.`, // Descripción actualizada para el LLM
  schema: z.object({
    servicio: z.string().describe("Nombre del servicio"),
    fecha: z.string().describe("Fecha para la búsqueda en formato YYYY-MM-DD"),
    hora: z.string().optional().describe("Hora preferida para la cita en formato HH:mm")
  }),
  func: async ({ servicio, fecha, hora }) => {
    const normalizedDate = normalizeDate(fecha);
    const service = await getServiceByName(servicio);
    if (!service || service.status !== ServiceStatus.Activo) return `El servicio '${servicio}' no está disponible.`;
    const duration = service.minutes_duration ?? 60;
    const workers = await getWorkersForService(service.id);
    if (!workers.length) return `No hay especialistas activos para '${servicio}'.`;
    const day = new Date(normalizedDate);
    day.setHours(0, 0, 0, 0);

    const workerIds = workers.map(w => w.id);
    const dayAppointments = await getAppointmentsForWorkersOnDate(workerIds, day);
    const mapApps = new Map<number, Appointment[]>();
    for (const w of workers) mapApps.set(w.id, []);
    for (const a of dayAppointments) {
      const list = mapApps.get(a.worker_id!)!;
      list.push(a);
    }

    // Se mantiene la definición del tipo para claridad
    type Suggestion = { worker_id: number; worker_name: string; start: string; end: string };

    if (hora) {
      for (const w of workers) {
        const end = addMinutes(hora, duration);
        const busy = mapApps.get(w.id)!.some(a => rangesOverlap(hora, end, a.hour, a.end_time!));
        if (!busy) {
          // Formato de salida para hora preferida con worker_id
          return `El horario de ${hora}-${end} está disponible con ${w.name} (ID: ${w.id}).`;
        }
      }
      return `Lo siento, el horario de ${hora} no está disponible. A continuación, te mostramos otras opciones.`;
    }

    const suggestions: Suggestion[] = [];
    for (const w of workers) {
      const free = computeWorkerFreeSlotsForDay(
        duration,
        day,
        w.schedule,
        mapApps.get(w.id) || []
      );
      for (const slot of free) {
        suggestions.push({ worker_id: w.id, worker_name: w.name, start: slot.start, end: slot.end });
      }
    }

    // Se ordena y se limita la cantidad de sugerencias para no saturar
    const uniqueSuggestions = Array.from(new Map(suggestions.map(item => [`${item.worker_id}-${item.start}`, item])).values());
    uniqueSuggestions.sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

    if (!uniqueSuggestions.length) return `No hay disponibilidad para '${servicio}' el ${normalizedDate}.`;

    const maxMorningSlots = 3;
    const maxAfternoonSlots = 2;

    const morningSlots = uniqueSuggestions.filter(s => toMinutes(s.start) < toMinutes('12:00')).slice(0, maxMorningSlots);
    const afternoonSlots = uniqueSuggestions.filter(s => toMinutes(s.start) >= toMinutes('12:00')).slice(0, maxAfternoonSlots);

    let responseLines = [];
    if (morningSlots.length > 0) {
      responseLines.push('**Horarios de la mañana:**');
      for (const slot of morningSlots) {
        // Formato de salida con worker_id: - HH:MM-HH:MM con Nombre (ID: N)
        responseLines.push(`- ${slot.start}-${slot.end} con ${slot.worker_name} (ID: ${slot.worker_id})`);
      }
    }

    if (afternoonSlots.length > 0) {
      if (responseLines.length > 0) {
        responseLines.push('');
      }
      responseLines.push('**Horarios de la tarde:**');
      for (const slot of afternoonSlots) {
        // Formato de salida con worker_id: - HH:MM-HH:MM con Nombre (ID: N)
        responseLines.push(`- ${slot.start}-${slot.end} con ${slot.worker_name} (ID: ${slot.worker_id})`);
      }
    }

    const lines = responseLines.join('\n');

    return `Opciones disponibles para '${servicio}' el ${normalizedDate}:\n${lines}`;
  }
});

// Reservar cita
export const bookAppointmentTool = new DynamicStructuredTool({
  name: "book_appointment",
  description: "Reserva una cita. Requiere cliente_id, servicio, fecha (YYYY-MM-DD), hora (HH:MM) y worker_id.",
  schema: z.object({
    cliente_id: z.number().describe("ID del cliente. Recuerda usar la herramienta 'find_client_by_phone' para tener el cliente_id, sino tienes que hacer 'create_client'."),
    servicio: z.string().describe("Nombre del servicio"),
    fecha: z.string().describe("Fecha de la cita en formato YYYY-MM-DD. Si el cliente no indica el año, usa el año actual (${new Date().getFullYear()})."),
    hora: z.string().describe("Hora de inicio de la cita en formato HH:MM"),
    worker_id: z.number().optional().describe("ID del especialista, si el cliente lo especificó o si lo proporcionó una herramienta de disponibilidad"),
  }),
  func: async ({ cliente_id, servicio, fecha, hora, worker_id }) => {
    const normalized = normalizeDate(fecha);
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const serviceRepo = AppDataSource.getRepository(Service);
      const clientRepo = AppDataSource.getRepository(Client);
      const apptRepo = AppDataSource.getRepository(Appointment);
      const workerRepo = AppDataSource.getRepository(Worker);

      const service = await serviceRepo.findOne({ where: { name: servicio } });
      if (!service || service.status !== ServiceStatus.Activo) return `El servicio '${servicio}' no existe o no está activo.`;
      const client = await clientRepo.findOneBy({ id: cliente_id });
      if (!client) return "No se encontró el cliente.";

      let worker: Worker | null = null;
      if (worker_id) {
        worker = await workerRepo.findOneBy({ id: worker_id });
      } else {
        const ws = await getWorkersForService(service.id);
        if (!ws.length) return "No hay especialistas activos para este servicio.";
        worker = ws[0];
      }

      if (!worker || worker.status !== WorkerStatus.Activo) return "El especialista indicado no está disponible.";

      const duration = service.minutes_duration ?? 60;
      const end = addMinutes(hora, duration);

      // Crea una cadena de fecha y hora que JavaScript interpretará correctamente en UTC
      const TZ_OFFSET_CARACAS = '-04:00';
      const startDateTime = new Date(`${normalized}T${hora}:00${TZ_OFFSET_CARACAS}`);
      const endDateTime = new Date(`${normalized}T${end}:00${TZ_OFFSET_CARACAS}`);

      const conflict = await apptRepo.findOne({
        where: {
          worker_id: worker.id,
          date: startDateTime, // Ahora `startDateTime` ya es una fecha UTC correcta
          status: Not(AppointmentStatus.Cancelado),
          hour: hora,
        }
      });
      if (conflict) return "El especialista no tiene ese horario disponible. Elige otra hora.";

      const newAppt = apptRepo.create({
        client, service, worker, date: startDateTime, hour: hora, end_time: end, status: AppointmentStatus.Pendiente
      });
      await queryRunner.manager.save(newAppt);

      // Google Calendar
      const event = {
        summary: `Cita: ${service.name} - ${client.name}`,
        description: `Servicio: ${service.name}\nCliente: ${client.name}\nTeléfono: ${client.phone}\nEspecialista: ${worker.name}\nReservado via WhatsApp Bot.`,
        start: { dateTime: startDateTime.toISOString(), timeZone: 'America/Caracas' },
        end: { dateTime: endDateTime.toISOString(), timeZone: 'America/Caracas' },
      };
      const calRes = await calendar.events.insert({ calendarId: CALENDAR_ID, requestBody: event });
      const eventId = calRes.data.id || null;

      if (eventId) {
        newAppt.calendar_event_id = eventId;
        await queryRunner.manager.save(newAppt);
      }

      await queryRunner.commitTransaction();

      return `✅ Cita agendada para ${client.name}:\n• Servicio: ${service.name}\n• Especialista: ${worker.name}\n• Fecha: ${normalized}\n• Hora: ${hora}-${end}\n• Precio: ${service.price} USD\nID cita: ${newAppt.id}`;
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      console.error("Error al reservar:", err);
      return `Error al reservar la cita: ${err.message}`;
    } finally {
      await queryRunner.release();
    }
  }
});

// Listar próximas citas del cliente
export const listUserAppointmentsTool = new DynamicStructuredTool({
  name: "list_user_appointments",
  description: "Lista citas futuras de un cliente por teléfono.",
  schema: z.object({ telefono: z.string() }),
  func: async ({ telefono }) => {
    const clientRepository = AppDataSource.getRepository(Client);
    const client = await clientRepository.findOne({ where: { phone: telefono } });
    if (!client) return "No se encontró un cliente con este teléfono.";

    const appointmentRepository = AppDataSource.getRepository(Appointment);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointments = await appointmentRepository.find({
      where: {
        client: { id: client.id },
        date: MoreThanOrEqual(today),
        status: AppointmentStatus.Pendiente
      },
      relations: ["service", "worker"],
      order: { date: "ASC", hour: "ASC" }
    });

    if (!appointments.length) return "No tienes citas próximas agendadas.";

    const list = appointments.map(a => {

      const appointmentDate = a.date instanceof Date ? a.date : new Date(a.date);

      const d = appointmentDate.toISOString().split('T')[0];

      const w = a.worker?.name ? ` con ${a.worker.name}` : '';
      return `- #${a.id}: ${a.service.name}${w} el ${d} ${a.hour}-${a.end_time ?? ''}`;
    }).join('\n');
    return `Tus próximas citas:\n${list}`;
  }
});

// Cancelar una cita (también borra el evento de Calendar si existe)
export const cancelAppointmentTool = new DynamicStructuredTool({
  name: "cancel_appointment",
  description: "Cancela una cita por ID y elimina el evento en Google Calendar si existe.",
  schema: z.object({ citaId: z.number() }),
  func: async ({ citaId }) => {
    const apptRepo = AppDataSource.getRepository(Appointment);
    const appt = await apptRepo.findOneBy({ id: citaId });
    if (!appt) return `No existe una cita con ID ${citaId}.`;

    appt.status = AppointmentStatus.Cancelado;
    try {
      await apptRepo.save(appt);
      if (appt.calendar_event_id) {
        try {
          await calendar.events.delete({ calendarId: CALENDAR_ID!, eventId: appt.calendar_event_id });
        } catch (e) {
          console.warn("No se pudo eliminar el evento de Calendar (quizá ya no existe).", e);
        }
      }
      return `✅ Cita ${citaId} cancelada.`;
    } catch (e) {
      console.error("Error al cancelar:", e);
      return `Error al cancelar la cita ${citaId}.`;
    }
  }
});
