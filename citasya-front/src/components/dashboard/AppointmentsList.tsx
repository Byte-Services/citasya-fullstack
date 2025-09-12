'use client';
import * as React from "react";
import { AppointmentItem } from "./AppointmentItem";

interface Client {
    name: string;
}
interface Worker {
    name: string;
}
interface Service {
    name: string;
}

interface AppointmentFromBackend {
    id: number;
    date: string;
    hour: string;
    status: string;
    client: Client | null; // Se agregó `| null` para manejar datos faltantes
    worker: Worker | null;
    service: Service | null;
}

interface AppointmentsListProps {
    startDate: string;
    endDate: string;
}

export const AppointmentsList: React.FC<AppointmentsListProps> = ({ startDate, endDate }) => {
    const [appointments, setAppointments] = React.useState<AppointmentFromBackend[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchAppointments = async () => {
            if (!startDate || !endDate) return;

            try {
                setLoading(true);
                // Se envían las fechas a la API
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/appointments?startDate=${startDate}&endDate=${endDate}`);

                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }

                const data: AppointmentFromBackend[] = await response.json();

                // Filtrar solo las citas pendientes o confirmadas
                const filteredData = data.filter(appointment =>
                    appointment.status === "Pendiente" || appointment.status === "Confirmado"
                );

                setAppointments(filteredData);
            } catch (err) {
                console.error("Error al obtener las citas:", err);
                setError("No se pudieron cargar las citas. Intente de nuevo más tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [startDate, endDate]); // Se actualiza cada vez que cambian las fechas

    if (loading) {
        return (
            <section className="flex flex-col pt-4 mx-auto w-full font-medium bg-white rounded-lg shadow-md max-md:mt-10 max-md:max-w-full">
                <div className="text-center py-8 text-neutral-500">
                    Cargando citas...
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="flex flex-col pt-4 mx-auto w-full font-medium bg-white rounded-lg shadow-md max-md:mt-10 max-md:max-w-full">
                <div className="text-center py-8 text-red-500">
                    {error}
                </div>
            </section>
        );
    }

    const formatTime = (time: string) => {
        if (time && time.length > 5) {
            return time.substring(0, 5);
        }
        return time;
    };
    
        // Función para formatear la fecha
    const formatDate = (dateString: string) => {
        // Si la cadena de fecha es '2025-09-12', la dividimos en sus partes
        const [year, month, day] = dateString.split('-').map(Number);
        
        // Creamos una nueva fecha usando las partes, lo que asegura que se use la zona horaria local.
        // Restamos 1 al mes porque en JavaScript los meses van de 0 a 11 (0=Enero, 8=Septiembre, etc.)
        const d = new Date(year, month - 1, day);

        // Formateamos la fecha a DD/MM/YYYY
        const formattedDay = d.getDate().toString().padStart(2, '0');
        const formattedMonth = (d.getMonth() + 1).toString().padStart(2, '0');
        const formattedYear = d.getFullYear();

        return `${formattedDay}/${formattedMonth}/${formattedYear}`;
    };

    return (
        <section className="flex flex-col mx-auto w-full font-medium bg-white rounded-lg shadow-md max-md:mt-10 max-md:max-w-full">
            <h2 className="self-center p-6 text-md font-medium rounded-t-lg text-left text-neutral-700 bg-neutral-100 w-full">
                Próximas citas
            </h2>
            <div>
                {appointments.length === 0 && (
                    <div className="text-center py-4 text-neutral-500">
                        No hay citas agendadas.
                    </div>
                )}

                {appointments.slice(0, 8).map((appointment) => {
                    if (!appointment.client || !appointment.worker || !appointment.service) {
                        return null; // Omitir si faltan datos
                    }
                    return (
                        <AppointmentItem
                            key={appointment.id}
                            clientName={appointment.client.name}
                            service={appointment.service.name}
                            specialist={appointment.worker.name}
                            time={formatTime(appointment.hour)}
                            date={formatDate(appointment.date)} // <-- ¡Se agrega la fecha aquí!

                        />
                    );
                })}
            </div>
            <div className="mt-4 text-center pb-6">
                <a
                    href="/appointments"
                    className="text-[#447F98] hover:text-[#629BB5] text-sm font-medium "
                >
                    Ver todas las citas →
                </a>
            </div>
        </section>
    );
};