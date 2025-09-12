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
import { DateTime } from 'luxon';

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

// Intersecta el horario del centro con la agenda del worker (si tiene schedule),
// y sustrae bloques ocupados por citas para producir slots disponibles
function computeWorkerFreeSlotsForDay(
  serviceDuration: number,
  date: Date,
  workerSchedule: any | null,
  existingAppointments: Appointment[],
  maxSlots = 10
): { start: string; end: string }[] {
  const center = getCenterWindow(date);
  // Por ahora ignoramos schedule detallado y usamos horario del centro si schedule es null
  // Si quisieras usar schedule JSON del worker, intersecta aquí (por día de semana).
  const baseStart = center.start;
  const baseEnd = center.end;

  // Bloques ocupados por citas del worker
  const busy: { start: string; end: string }[] = existingAppointments.map(a => ({
    start: a.hour,
    end: a.end_time ?? addMinutes(a.hour, 60) // fallback por si faltan datos antiguos
  }));

  // Generamos candidatos cada 15 minutos
  const candidates = generateCandidateSlots(baseStart, baseEnd, serviceDuration, 15);

  const result: { start: string; end: string }[] = [];
  for (const start of candidates) {
    const end = addMinutes(start, serviceDuration);
    const overlaps = busy.some(b => rangesOverlap(start, end, b.start, b.end));
    if (!overlaps) {
      result.push({ start, end });
      if (result.length >= maxSlots) break;
    }
  }
  return result;
}

// ---------------- TOOLS ----------------

// Buscar cliente por teléfono
export const findClientByPhoneTool = new DynamicStructuredTool({
  name: "find_client_by_phone",
  description: "Busca un cliente por su número de teléfono.",
  schema: z.object({ telefono: z.string().describe("Número de teléfono") }),
  func: async ({ telefono }) => {
    const clientRepository = AppDataSource.getRepository(Client);
    const client = await clientRepository.findOne({ where: { phone: telefono } });
    if (client) return `Cliente existente: ${client.name} (ID ${client.id}).`;
    return "No se encontró cliente con este teléfono.";
  }
});

// Crear cliente
export const createClientTool = new DynamicStructuredTool({
  name: "create_client",
  description: "Crea un cliente nuevo.",
  schema: z.object({
    nombre_completo: z.string(),
    cedula: z.string(),
    fecha_nacimiento: z.string().describe("YYYY-MM-DD"),
    telefono: z.string(),
  }),
  func: async ({ nombre_completo, cedula, fecha_nacimiento, telefono }) => {
    try {
      const repo = AppDataSource.getRepository(Client);
      const newClient = repo.create({
        name: nombre_completo,
        documentId: cedula,
        phone: telefono
      });
      await repo.save(newClient);
      return `Cliente creado con ID: ${newClient.id}.`;
    } catch (e) {
      console.error(e);
      return "Error al crear el cliente (posible documento duplicado).";
    }
  }
});

// Listar TODAS las especialidades — NUEVO
export const listSpecialtiesTool = new DynamicStructuredTool({
  name: "list_specialties",
  description: "Lista las categorías/especialidades de servicios disponibles.",
  schema: z.object({}),
  func: async () => {
    const repo = AppDataSource.getRepository(Specialty);
    const all = await repo.find({ order: { name: 'ASC' } });
    if (!all.length) return "No hay categorías disponibles.";
    return "Categorías:\n" + all.map((s, i) => `${i + 1}. ${s.name}`).join('\n');
  }
});

// Listar servicios por especialidad — NUEVO
export const listServicesBySpecialtyTool = new DynamicStructuredTool({
  name: "list_services_by_specialty",
  description: "Lista servicios activos de una especialidad.",
  schema: z.object({
    especialidad: z.string().describe("Nombre de la especialidad, p.ej. 'Peluquería'")
  }),
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

// Listar servicios activos
export const listServicesTool = new DynamicStructuredTool({
  name: "list_services",
  description: "Lista los servicios activos del spa.",
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
  description: "Obtiene descripción, precio y duración de un servicio.",
  schema: z.object({ servicio: z.string() }),
  func: async ({ servicio }) => {
    const serviceRepository = AppDataSource.getRepository(Service);
    const service = await serviceRepository.findOne({ where: { name: servicio } });
    if (!service) return `No encontré el servicio '${servicio}'.`;
    return `Servicio '${service.name}': ${service.description || 'Sin descripción'} | Precio: ${service.price} USD | Duración: ${service.minutes_duration} minutos.`;
  }
});

// Verifica horarios disponibles para un servicio en un rango de fechas
export const checkServiceAvailabilityTool = new DynamicStructuredTool({
  name: "check_service_availability",
  description: "Verifica horarios disponibles para un servicio. Considera duración, horario laboral del trabajador y citas ya agendadas.",
  schema: z.object({
    serviceId: z.number().describe("ID del servicio"),
    startDate: z.string().describe("Fecha inicial en formato YYYY-MM-DD"),
    endDate: z.string().describe("Fecha final en formato YYYY-MM-DD"),
    preferredWorker: z.string().optional().describe("Nombre del especialista preferido si el cliente lo pide"),
  }),
  func: async ({ serviceId, startDate, endDate, preferredWorker }) => {
    const serviceRepo = AppDataSource.getRepository(Service);
    const workerRepo = AppDataSource.getRepository(Worker);
    const appointmentRepo = AppDataSource.getRepository(Appointment);

    const service = await serviceRepo.findOne({ where: { id: serviceId } });
    if (!service) return `No se encontró el servicio con ID ${serviceId}`;

    // Buscar workers que prestan este servicio
    let workersQuery = workerRepo
      .createQueryBuilder("worker")
      .leftJoinAndSelect("worker.services", "service")
      .where("service.id = :serviceId", { serviceId })
      .andWhere("worker.status = :status", { status: WorkerStatus.Activo });

    if (preferredWorker) {
      workersQuery = workersQuery.andWhere("worker.name ILIKE :name", {
        name: `%${preferredWorker}%`,
      });
    }

    const workers = await workersQuery.getMany();
    if (!workers.length) {
      return preferredWorker
        ? `El especialista ${preferredWorker} no está disponible para este servicio.`
        : "No hay especialistas disponibles para este servicio.";
    }

    const results: string[] = [];

    for (const worker of workers) {
      const schedule = worker.schedule?.days ?? {};
      const breakTime = worker.schedule?.breakTime || "13:00";

      const start = DateTime.fromISO(startDate, { zone: "America/Mexico_City" });
      const end = DateTime.fromISO(endDate, { zone: "America/Mexico_City" });

      let workerSlots: string[] = [];

      for (let day = start; day <= end; day = day.plus({ days: 1 })) {
        const weekday = day.toFormat("ccc") as keyof typeof schedule; // Mon, Tue, ...
        const daySchedule = schedule[weekday];
        if (!daySchedule?.enabled) continue;

        const startTime = DateTime.fromISO(`${day.toISODate()}T${daySchedule.startTime}`, {
          zone: "America/Mexico_City",
        });
        const endTime = DateTime.fromISO(`${day.toISODate()}T${daySchedule.endTime}`, {
          zone: "America/Mexico_City",
        });

        // Citas ya agendadas para ese día
        const appointments = await appointmentRepo.find({
          where: {
            worker: { id: worker.id },
            date: day.toJSDate(),
            status: AppointmentStatus.Pendiente,
          },
          order: { hour: "ASC" },
        });

        let current = startTime;
        for (const appt of appointments) {
          const apptStart = DateTime.fromFormat(
            `${appt.date} ${appt.hour}`,
            "yyyy-MM-dd HH:mm",
            { zone: "America/Mexico_City" }
          );
          const apptEnd = apptStart.plus({ minutes: appt.service?.minutes_duration });

          // Ver si hay hueco antes de la cita
          if (apptStart.diff(current, "minutes").minutes >= service.minutes_duration) {
            workerSlots.push(`${current.toFormat("yyyy-MM-dd HH:mm")}`);
          }

          current = apptEnd;
        }

        // Ver si queda espacio al final del día
        if (endTime.diff(current, "minutes").minutes >= service.minutes_duration) {
          workerSlots.push(`${current.toFormat("yyyy-MM-dd HH:mm")}`);
        }
      }

      if (workerSlots.length) {
        results.push(
          `Disponibilidad de ${worker.name}:\n${workerSlots
            .slice(0, 5)
            .join("\n")}${workerSlots.length > 5 ? "\n...más opciones disponibles" : ""}`
        );
      } else {
        results.push(`El especialista ${worker.name} no tiene huecos en las fechas solicitadas.`);
      }
    }

    return results.join("\n\n");
  },
});


// Sugerir SLOTS disponibles por servicio (elige automáticamente un trabajador que lo haga) — NUEVO
export const getAvailableSlotsTool = new DynamicStructuredTool({
  name: "get_available_slots",
  description: "Devuelve opciones de horarios disponibles para un servicio en una fecha dada, considerando la duración, el horario del centro y la agenda de los especialistas.",
  schema: z.object({
    servicio: z.string(),
    fecha: z.string().describe("YYYY-MM-DD"),
    max_opciones: z.number().default(5)
  }),
  func: async ({ servicio, fecha, max_opciones }) => {
    const service = await getServiceByName(servicio);
    if (!service || service.status !== ServiceStatus.Activo) return `El servicio '${servicio}' no está disponible.`;
    const duration = service.minutes_duration ?? 60;

    const workers = await getWorkersForService(service.id);
    if (!workers.length) return `No hay especialistas activos para '${servicio}'.`;

    const day = new Date(fecha);
    day.setHours(0,0,0,0);

    const workerIds = workers.map(w => w.id);
    const dayAppointments = await getAppointmentsForWorkersOnDate(workerIds, day);

    // Agrupamos citas por worker
    const mapApps = new Map<number, Appointment[]>();
    for (const w of workers) mapApps.set(w.id, []);
    for (const a of dayAppointments) {
      const list = mapApps.get(a.worker_id!)!;
      list.push(a);
    }

    // Calculamos slots por worker y juntamos
    type Suggestion = { worker_id: number; worker_name: string; start: string; end: string };
    const suggestions: Suggestion[] = [];
    for (const w of workers) {
      const free = computeWorkerFreeSlotsForDay(
        duration, day, (w as any).schedule ?? null,
        mapApps.get(w.id) || [],
        max_opciones
      );
      for (const slot of free) {
        suggestions.push({ worker_id: w.id, worker_name: w.name, start: slot.start, end: slot.end });
      }
    }

    // Ordenamos por hora de inicio
    suggestions.sort((a,b) => toMinutes(a.start) - toMinutes(b.start));

    if (!suggestions.length) return `No hay disponibilidad el ${fecha} para '${servicio}'.`;

    // Devolvemos como lista legible
    const top = suggestions.slice(0, max_opciones);
    const lines = top.map((s, i) => `${i+1}. ${fecha} ${s.start}-${s.end} con ${s.worker_name} (Worker ID: ${s.worker_id})`);
    return `Opciones disponibles para '${servicio}':\n` + lines.join('\n');
  }
});

// Reservar cita (con hora fin y calendar_event_id) — actualizado
export const bookAppointmentTool = new DynamicStructuredTool({
  name: "book_appointment",
  description: "Reserva una cita. Requiere cliente_id, servicio, fecha (YYYY-MM-DD), hora (HH:MM) y opcional worker_id. Calcula hora fin según duración del servicio.",
  schema: z.object({
    cliente_id: z.number(),
    servicio: z.string(),
    fecha: z.string().describe("YYYY-MM-DD"),
    hora: z.string().describe("HH:MM"),
    worker_id: z.number().optional()
  }),
  func: async ({ cliente_id, servicio, fecha, hora, worker_id }) => {
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

      // Elegimos un worker válido si no vino
      let worker: Worker | null = null;
      if (worker_id) {
        worker = await workerRepo.findOneBy({ id: worker_id });
        if (!worker || worker.status !== WorkerStatus.Activo) return "El especialista indicado no está disponible.";
      } else {
        // uno cualquiera que preste el servicio
        const ws = await getWorkersForService(service.id);
        if (!ws.length) return "No hay especialistas activos para este servicio.";
        worker = ws[0];
      }

      const duration = service.minutes_duration ?? 60;
      const end = addMinutes(hora, duration);

      // Validar conflictos del worker
      const day = new Date(fecha);
      day.setHours(0,0,0,0);
      const sameDay = await apptRepo.find({
        where: {
          worker_id: worker.id,
          date: day,
          status: Not(AppointmentStatus.Cancelado)
        }
      });
      const conflict = sameDay.some(a => rangesOverlap(hora, end, a.hour, a.end_time ?? addMinutes(a.hour, duration)));
      if (conflict) return "El especialista no tiene ese horario disponible. Elige otra hora.";

      // Crear cita
      const newAppt = apptRepo.create({
        client,
        service,
        worker,
        date: day,
        hour: hora,
        end_time: end,
        status: AppointmentStatus.Pendiente
      });
      await queryRunner.manager.save(newAppt);

      // Google Calendar
      const startDateTime = new Date(`${fecha}T${hora}:00`);
      const endDateTime = new Date(`${fecha}T${end}:00`);
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

      return `✅ Cita agendada para ${client.name}:\n• Servicio: ${service.name}\n• Especialista: ${worker.name}\n• Fecha: ${fecha}\n• Hora: ${hora}-${end}\n• Precio: ${service.price} USD\nID cita: ${newAppt.id}`;
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
    const today = new Date(); today.setHours(0,0,0,0);

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
      const d = a.date.toISOString().split('T')[0];
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
