"use client";
import { StatsGrid } from "@/components/common/stats";
import { AppointmentsTable } from "@/components/ui/AppointmentsTable";
import { QuickActions } from "@/components/ui/QuickActions";
import { Appointment } from "@/interfaces/appointment";
import { useAppointmentStore } from "@/store/appointmentStore";
import { CalendarIcon, DollarSignIcon, TrendingUpIcon, UsersIcon } from "lucide-react";
import { useEffect } from "react";

export const ComponentHome = () => {



      const { appointments, fetchAppointments } = useAppointmentStore();
    
    
      useEffect(() => {
        fetchAppointments();
      }, []);
    
    
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
    
    
      const nextAppointments = appointments.map((appointment: Appointment) => {
        return {
          id: appointment.id,
          time: appointment.hour,
          client: appointment.client?.name || '',
          service: appointment.service?.name || '',
          specialist: appointment.worker?.name  || '',
          status: appointment.status,
        };
      });
    
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