import { Appointment } from "@/interfaces/appointment";

export type TimelineState = "upcoming" | "in_progress" | "past";

const FINAL_STATUSES = new Set([
    "cancelado",
    "cancelada",
    "canceled",
    "cancelled",
    "concluida",
    "completada",
    "completed",
    "no_show",
    "no_asistio",
]);

const parseHour = (value?: string) => {
    if (!value) return { hour: 0, minute: 0, valid: false };

    const [hourPart, minutePart] = value.split(":").slice(0, 2);
    const hour = Number(hourPart);
    const minute = Number(minutePart);
    const valid =
        Number.isFinite(hour) &&
        Number.isFinite(minute) &&
        hour >= 0 &&
        hour <= 23 &&
        minute >= 0 &&
        minute <= 59;

    return { hour: valid ? hour : 0, minute: valid ? minute : 0, valid };
};

export const appointmentStartDateTime = (appointment: Appointment) => {
    if (!appointment.date) return null;

    const day = new Date(`${appointment.date}T00:00:00`);
    if (Number.isNaN(day.getTime())) return null;

    const { hour, minute } = parseHour(appointment.hour);
    day.setHours(hour, minute, 0, 0);
    return day;
};

export const appointmentEndDateTime = (appointment: Appointment) => {
    const start = appointmentStartDateTime(appointment);
    if (!start) return null;

    const durationMinutes = Math.max(1, Number(appointment.service?.minutes_duration || 60));
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + durationMinutes);
    return end;
};

export const isFinalStatus = (status?: string) => FINAL_STATUSES.has((status || "").toLowerCase());

export const getTimelineState = (appointment: Appointment, now = new Date()): TimelineState => {
    const start = appointmentStartDateTime(appointment);
    const end = appointmentEndDateTime(appointment);

    if (!start || !end) return "past";
    if (now < start) return "upcoming";
    if (now >= start && now < end) return "in_progress";
    return "past";
};
