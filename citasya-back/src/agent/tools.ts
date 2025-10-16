import { DynamicStructuredTool } from 'langchain/tools';
import { z } from 'zod';
import { google } from 'googleapis';
import { AppDataSource } from '../data-source.js';
import { Service, ServiceStatus } from '../modules/services/service.model.js';
import { Client } from '../modules/clients/client.model.js';
import { Appointment, AppointmentStatus } from '../modules/appointments/appointment.model.js';
import { Worker, WorkerStatus } from '../modules/workers/worker.model.js';
import { Specialty } from '../modules/specialties/specialty.model.js';
import { MoreThanOrEqual, Not, In, Between } from 'typeorm';

//  Google Calendar
const SERVICE_ACCOUNT_KEY_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || './service_account_key.json';
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_KEY_PATH,
  scopes: ['https://www.googleapis.com/auth/calendar'],
});
const calendar = google.calendar({ version: 'v3', auth });

//  Utilidades de tiempo

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
  const dow = date.getUTCDay();
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

    if (fecha.includes('-')) {
        const parts = fecha.split('-');
        if (parts.length === 3) {
            year = parseInt(parts[0], 10);
            month = parseInt(parts[1], 10);
            day = parseInt(parts[2], 10);
        } else {
            month = parseInt(parts[0], 10);
            day = parseInt(parts[1], 10);
        }
    } else if (fecha.includes('/')) {
        const parts = fecha.split('/');
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
    } else {
        day = parseInt(fecha, 10);
        month = today.getMonth() + 1;
    }

    let dateObj = new Date(currentYear, month - 1, day);

    if (dateObj < today) {
        dateObj.setFullYear(currentYear + 1);
    }

    const formattedMonth = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const formattedDay = dateObj.getDate().toString().padStart(2, '0');

    return `${dateObj.getFullYear()}-${formattedMonth}-${formattedDay}`;
}


//  Helpers de datos
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

  // Obtener rango del día completo
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const apps = await apptRepo.find({
    where: {
      worker_id: In(workerIds),
      date: Between(startOfDay, endOfDay),
      status: Not(AppointmentStatus.Cancelado),
    },
    order: { hour: "ASC" },
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
  if (!workerSchedule) return []; 

  const localDow = date.getDay() as DayIdx;
  const centerHours = getCenterWindow(date);
  let baseStart = centerHours.start;
  let baseEnd = centerHours.end;

  if (workerSchedule.days) {
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
    end: a.end_time ?? addMinutes(a.hour, 60),
  }));

  if (workerSchedule.breakTime) {
    const bt = workerSchedule.breakTime.toString().toLowerCase();
    if (bt !== "none") {
      if (bt.includes("-")) {
        const [breakStart, breakEnd] = bt.split("-");
        if (rangesOverlap(baseStart, baseEnd, breakStart, breakEnd)) {
          busy.push({ start: breakStart, end: breakEnd });
        }
      } else {
        const breakStart = bt;
        const breakEnd = addMinutes(breakStart, 60);
        if (rangesOverlap(baseStart, baseEnd, breakStart, breakEnd)) {
          busy.push({ start: breakStart, end: breakEnd });
        }
      }
    }
  }

  const candidates = generateCandidateSlots(baseStart, baseEnd, serviceDuration, 15);

  const result: { start: string; end: string }[] = [];
  for (const start of candidates) {
    const end = addMinutes(start, serviceDuration);

    // validar que quepa dentro de la jornada
    if (toMinutes(end) > toMinutes(baseEnd)) continue;

    const overlaps = busy.some(b => rangesOverlap(start, end, b.start, b.end));
    if (!overlaps) {
      result.push({ start, end });
    }
  }
  return result;
}


//  TOOLS 

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


// Listar TODAS las especialidades 
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
  description: "Devuelve la lista exacta de nombres de servicios disponibles en el spa. **Estos nombres deben usarse literalmente sin alterarlos, reformularlos ni traducirlos.**",
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
export const getAvailableSlotsTool = new DynamicStructuredTool({
  name: "get_available_slots",
  description: `Devuelve opciones de horarios disponibles para un servicio en una fecha dada.
    - El formato correcto de fecha es YYYY-MM-DD.
    - Si el cliente no menciona el año, usa siempre el año actual (${new Date().getFullYear()}).
    - Si el cliente no menciona el mes, usa siempre el mes en curso (${new Date().getMonth() + 1}).
    - Nunca inventes otro año o mes.
    IMPORTANTE: La herramienta devuelve una estructura JSON. El campo "display" es para mostrar al cliente,
    mientras que "worker_id" es para que el agente lo use al reservar la cita.`,
  schema: z.object({
    servicio: z.string().describe("Nombre del servicio"),
    fecha: z.string().describe("Fecha para la búsqueda en formato YYYY-MM-DD"),
    hora: z.string().optional().describe("Hora preferida para la cita en formato HH:mm"),
    worker_name: z.string().optional().describe("Nombre del especialista solicitado por el cliente, por ejemplo 'Anna Ramirez'")
  }),
  func: async ({ servicio, fecha, hora, worker_name }) => {
    const normalizedDate = normalizeDate(fecha);
    const service = await getServiceByName(servicio);
    if (!service || service.status !== ServiceStatus.Activo) {
      return JSON.stringify({ error: `El servicio '${servicio}' no está disponible.` });
    }

    const duration = service.minutes_duration ?? 60;
    let workers = await getWorkersForService(service.id);
    if (!workers.length) {
      return JSON.stringify({ error: `No hay especialistas activos para '${servicio}'.` });
    }

    // Filtrar por especialista solicitado
    if (worker_name) {
      const match = workers.filter(w =>
        w.name.toLowerCase().includes(worker_name.toLowerCase())
      );

      if (match.length === 0) {
        return JSON.stringify({
          error: `No encontré un especialista con el nombre '${worker_name}' para el servicio '${servicio}'.`
        });
      }

      if (match.length > 1) {
        return JSON.stringify({
          clarification: `Encontré varios especialistas que coinciden con '${worker_name}'. ¿A cuál te refieres?`,
          options: match.map(w => w.name)
        });
      }

      workers = match; 
    }

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

    type Suggestion = { display: string; worker_id: number; hora: string; end: string };

    //Caso en que el cliente pidió una hora exacta
    if (hora) {
      for (const w of workers) {
        const end = addMinutes(hora, duration);
        const busy = mapApps.get(w.id)!.some(a => rangesOverlap(hora, end, a.hour, a.end_time!));
        if (!busy) {
          return JSON.stringify({
            servicio,
            fecha: normalizedDate,
            slots: [{
              display: `El horario de ${hora}-${end} está disponible con ${w.name}.`,
              worker_id: w.id,
              hora,
              end
            }]
          });
        }
      }
      return JSON.stringify({
        error: `Lo siento, el horario de ${hora} no está disponible. A continuación, te mostramos otras opciones.`
      });
    }

    //Caso en que no hay hora, sugiere
    const suggestions: Suggestion[] = [];
    for (const w of workers) {
      const free = computeWorkerFreeSlotsForDay(
        duration,
        day,
        w.schedule,
        mapApps.get(w.id) || []
      );
      for (const slot of free) {
        suggestions.push({
          display: `${slot.start}-${slot.end} con ${w.name}`,
          worker_id: w.id,
          hora: slot.start,
          end: slot.end
        });
      }
    }

    if (!suggestions.length) {
      return JSON.stringify({
        error: `No hay disponibilidad para '${servicio}' el ${normalizedDate}.`
      });
    }

    // Ordenar y limitar resultados
    const uniqueSuggestions = Array.from(
      new Map(suggestions.map(item => [`${item.worker_id}-${item.hora}`, item])).values()
    );
    uniqueSuggestions.sort((a, b) => toMinutes(a.hora) - toMinutes(b.hora));

    const maxMorningSlots = 3;
    const maxAfternoonSlots = 2;

    const morningSlots = uniqueSuggestions.filter(s => toMinutes(s.hora) < toMinutes("12:00")).slice(0, maxMorningSlots);
    const afternoonSlots = uniqueSuggestions.filter(s => toMinutes(s.hora) >= toMinutes("12:00")).slice(0, maxAfternoonSlots);

    return JSON.stringify({
      servicio,
      fecha: normalizedDate,
      slots: [
        ...morningSlots,
        ...afternoonSlots
      ]
    });
  }
});


// Reservar cita
export const bookAppointmentTool = new DynamicStructuredTool({
  name: "book_appointment",
  description: `Reserva una cita para un cliente existente. 
                Antes de usar esta herramienta:
                - Verifica que el cliente exista con 'find_client_by_phone'.
                - Si no existe, crea uno con 'create_client' y usa el 'cliente_id' devuelto.
                Nunca uses un cliente_id por defecto o inventado. 
                Requiere cliente_id, servicio, fecha (YYYY-MM-DD), hora (HH:MM) y worker_id.`,
  schema: z.object({
    cliente_id: z.number().describe("ID del cliente (usar 'find_client_by_phone' o 'create_client')."),
    servicio: z.string().describe("Nombre del servicio"),
    fecha: z.string().describe(`Fecha de la cita en formato YYYY-MM-DD. Si el cliente no indica el año, usa el año actual (${new Date().getFullYear()}).`),
    hora: z.string().describe("Hora de inicio de la cita en formato HH:MM"),
    worker_id: z.number().describe("ID del especialista (obtenido de 'get_available_slots')."),
  }),
  func: async ({ cliente_id, servicio, fecha, hora, worker_id }) => {

    //Validación de cliente antes de continuar
    if (!cliente_id || cliente_id === 1) {
      const clientRepo = AppDataSource.getRepository(Client);
      const existing = await clientRepo.findOneBy({ id: cliente_id });
      if (!existing) {
        throw new Error("Cliente no registrado. Debes crear el cliente antes de agendar.");
      }
    }

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

      const worker = await workerRepo.findOneBy({ id: worker_id });
      if (!worker || worker.status !== WorkerStatus.Activo) return "El especialista indicado no está disponible.";

      const duration = service.minutes_duration ?? 60;
      const end = addMinutes(hora, duration);

      const TZ_OFFSET_CARACAS = '-04:00';
      const startDateTime = new Date(`${normalized}T${hora}:00${TZ_OFFSET_CARACAS}`);
      const endDateTime = new Date(`${normalized}T${end}:00${TZ_OFFSET_CARACAS}`);

      const conflict = await apptRepo.createQueryBuilder("a")
        .where("a.worker_id = :workerId", { workerId: worker.id })
        .andWhere("DATE(a.date) = :date", { date: normalized })
        .andWhere("a.status != :cancelled", { cancelled: AppointmentStatus.Cancelado })
        .andWhere(
          "( (a.hour <= :hora AND a.end_time > :hora) OR (a.hour < :end AND a.end_time >= :end) OR (:hora < a.hour AND :end > a.hour) )",
          { hora, end }
        )
        .getOne();

      if (conflict) {
        await queryRunner.rollbackTransaction();
        return "El especialista ya tiene una cita en ese horario. Por favor, elige otra hora.";
      }
      
      const newAppt = apptRepo.create({
        client, service, worker,
        date: startDateTime,
        hour: hora,
        end_time: end,
        status: AppointmentStatus.Pendiente
      });
      await queryRunner.manager.save(newAppt);

      // Google Calendar
      const event = {
        summary: `Cita: ${service.name} - ${client.name}`,
        description: `Servicio: ${service.name}\nCliente: ${client.name}\nTeléfono: ${client.phone}\nEspecialista: ${worker.name}\nReservado vía WhatsApp Bot.`,
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

      return `Cita agendada:\n• Cliente: ${client.name}\n• Servicio: ${service.name}\n• Especialista: ${worker.name}\n• Fecha: ${normalized}\n• Hora: ${hora}-${end}\n• Precio: ${service.price} USD\n• ID cita: ${newAppt.id}`;
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      return `Error al reservar la cita: ${err.message}`;
    } finally {
      await queryRunner.release();
    }
  }
});


// Listar próximas citas del cliente
export const listUserAppointmentsTool = new DynamicStructuredTool({
  name: "list_user_appointments",
  description: "Lista citas futuras de un cliente por teléfono. Utiliza por defecto el número de teléfono del cliente que envió el mensaje: {sender_phone}.",
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
      return `ID: ${a.id} | Servicio: ${a.service.name}${w} | Fecha: ${d} | Hora: ${a.hour}-${a.end_time ?? ''}`;
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
      return ` Cita ${citaId} cancelada.`;
    } catch (e) {
      return `Error al cancelar la cita ${citaId}.`;
    }
  }
});
