"use client";
import { StatsGrid } from "@/components/common/stats";
import { AppointmentsTable } from "@/components/ui/AppointmentsTable";
import { QuickActions } from "@/components/ui/QuickActions";
import { Appointment } from "@/interfaces/appointment";
import { useAppointmentStore } from "@/store/appointmentStore";
import { getTimelineState, isFinalStatus } from "@/utils/appointmentTimeline";
import { CalendarIcon, DollarSignIcon, TrendingUpIcon, UsersIcon } from "lucide-react";
import { useEffect, useMemo } from "react";

export const ComponentHome = () => {



      const { appointments, fetchAppointments } = useAppointmentStore();
    
    
      useEffect(() => {
        fetchAppointments();
      }, [fetchAppointments]);
    
    
      // Mock stats
      const stats = [
        {
          label: "Citas Hoy",
          value: "8",
          icon: CalendarIcon,
          trend: "+2 vs ayer",
          trendUp: true,
        },
        {
          label: "Clientes Nuevos",
          value: "3",
          icon: UsersIcon,
          trend: "+1 vs ayer",
          trendUp: true,
        },
        {
          label: "Ingresos del Día",
          value: "$450",
          icon: DollarSignIcon,
          trend: "+15% vs ayer",
          trendUp: true,
        },
        {
          label: "Tasa de Asistencia",
          value: "92%",
          icon: TrendingUpIcon,
          trend: "-2% vs mes pasado",
          trendUp: false,
        },
      ];
    
      // Mock próximas citas
      // const nextAppointments = [
      //   {
      //     id: 1,
      //     time: "10:00 AM",
      //     client: "María González",
      //     service: "Masaje Relajante",
      //     specialist: "Ana Silva",
      //     status: "confirmada",
      //   },
      //   {
      //     id: 2,
      //     time: "11:30 AM",
      //     client: "Carlos Ruiz",
      //     service: "Limpieza Facial",
      //     specialist: "Laura Gómez",
      //     status: "pendiente",
      //   },
      //   {
      //     id: 3,
      //     time: "01:00 PM",
      //     client: "Elena Torres",
      //     service: "Manicure Spa",
      //     specialist: "Sofía Paz",
      //     status: "confirmada",
      //   },
      //   {
      //     id: 4,
      //     time: "03:00 PM",
      //     client: "Patricia Vega",
      //     service: "Exfoliación Corporal",
      //     specialist: "Ana Silva",
      //     status: "confirmada",
      //   },
      //   {
      //     id: 5,
      //     time: "04:30 PM",
      //     client: "Roberto Díaz",
      //     service: "Masaje Descontracturante",
      //     specialist: "Carlos Mora",
      //     status: "pendiente",
      //   },
      // ];
    

          const nextAppointments = useMemo(() => {
            const now = new Date();

                const formatDateLabel = (dateValue: string) => {
                  const date = new Date(`${dateValue}T00:00:00`);
                  if (Number.isNaN(date.getTime())) return "Fecha inválida";

                  const today = new Date();
                  const tomorrow = new Date(today);
                  tomorrow.setDate(today.getDate() + 1);

                  const normalize = (d: Date) => {
                    const copy = new Date(d);
                    copy.setHours(0, 0, 0, 0);
                    return copy.getTime();
                  };

                  if (normalize(date) === normalize(today)) return "Hoy";
                  if (normalize(date) === normalize(tomorrow)) return "Mañana";

                  return date.toLocaleDateString("es-ES", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                  });
                };

                const formatTimeLabel = (hourValue: string) => {
                  const [hourPart = "0", minutePart = "0"] = hourValue.split(":").slice(0, 2);
                  const hour = Number(hourPart);
                  const minute = Number(minutePart);
                  const date = new Date();
                  date.setHours(Number.isFinite(hour) ? hour : 0, Number.isFinite(minute) ? minute : 0, 0, 0);

                  return date.toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                };

            return (appointments as Appointment[])
              .filter((appointment) => {
                const timeline = getTimelineState(appointment, now);
                if (timeline === "past") return false;
                if (isFinalStatus(appointment.status)) return false;
                return true;
              })
              .sort((a, b) => {
                const aValue = `${a.date}T${a.hour || "00:00"}`;
                const bValue = `${b.date}T${b.hour || "00:00"}`;
                return new Date(aValue).getTime() - new Date(bValue).getTime();
              })
              .slice(0, 8)
              .map((appointment) => {
                const timeline = getTimelineState(appointment, now);
                return {
                  id: appointment.id,
                  date: formatDateLabel(appointment.date),
                  time: formatTimeLabel(appointment.hour || "00:00"),
                  client: appointment.client?.name || '',
                  service: appointment.service?.name || '',
                  specialist: appointment.worker?.name || '',
                  status: timeline === "in_progress" ? "en progreso" : "programada",
                };
              });
          }, [appointments]);
    
    return (
        <div className="max-w-6xl mx-auto min-h-screen">

            {/* Stats Grid */}
            <StatsGrid stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Next Appointments */}
                <AppointmentsTable appointments={nextAppointments} />

                {/* Quick Actions */}
                <QuickActions />
            </div>
        </div>
    );
}