"use client";
import { StatsGrid } from "@/components/common/stats";
import { AppointmentsTable } from "@/components/ui/AppointmentsTable";
import { QuickActions } from "@/components/ui/QuickActions";
import { Appointment } from "@/interfaces/appointment";
import { useAppointmentStore } from "@/store/appointmentStore";
import { useReportDashboardStore } from "@/store/reportStore";
import { getTimelineState, isFinalStatus } from "@/utils/appointmentTimeline";
import { CalendarIcon, DollarSignIcon, TrendingUpIcon, UsersIcon } from "lucide-react";
import { useEffect, useMemo } from "react";

export const ComponentHome = () => {
      const { appointments, fetchAppointments } = useAppointmentStore();
      const { metrics, fetchDashboardMetrics } = useReportDashboardStore();

      useEffect(() => {
        fetchAppointments();
        fetchDashboardMetrics();
      }, [fetchAppointments, fetchDashboardMetrics]);

      const formatDelta = (value: number, suffix: string) => {
        const sign = value > 0 ? "+" : "";
        return `${sign}${value} ${suffix}`;
      };

      const formatCurrency = (value: number) =>
        new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(value);

      const stats = [
        {
          label: "Citas Hoy",
          value: String(metrics?.citasHoy?.value ?? 0),
          icon: CalendarIcon,
          trend: formatDelta(metrics?.citasHoy?.vsAyer ?? 0, "vs ayer"),
          trendUp: (metrics?.citasHoy?.vsAyer ?? 0) >= 0,
        },
        {
          label: "Clientes Nuevos",
          value: String(metrics?.clientesNuevos?.value ?? 0),
          icon: UsersIcon,
          trend: formatDelta(metrics?.clientesNuevos?.vsAyer ?? 0, "vs ayer"),
          trendUp: (metrics?.clientesNuevos?.vsAyer ?? 0) >= 0,
        },
        {
          label: "Ingresos del Día",
          value: formatCurrency(metrics?.ingresosDia?.value ?? 0),
          icon: DollarSignIcon,
          trend: formatDelta(metrics?.ingresosDia?.vsAyer ?? 0, "% vs ayer"),
          trendUp: (metrics?.ingresosDia?.vsAyer ?? 0) >= 0,
        },
        {
          label: "Tasa de Asistencia",
          value: `${metrics?.tasaAsistencia?.value ?? 0}%`,
          icon: TrendingUpIcon,
          trend: formatDelta(metrics?.tasaAsistencia?.vsMesPasado ?? 0, "% vs mes pasado"),
          trendUp: (metrics?.tasaAsistencia?.vsMesPasado ?? 0) >= 0,
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
        <div className="w-full max-w-screen-2xl mx-auto min-h-screen">

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