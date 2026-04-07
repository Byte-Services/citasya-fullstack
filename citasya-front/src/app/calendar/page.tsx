"use client";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageLayout from "@/components/layout/PageLayout";
import SidebarLayout from "@/components/layout/SidebarLayout";
import DateForm from "@/components/form/DateForm";
import Calendar from "@/components/ui/Calendar";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react";
import { useAppointmentStore } from "@/store/appointmentStore";
import { Appointment } from "@/interfaces/appointment";

export default function CalendarPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { appointments: storeAppointments, fetchAppointments } = useAppointmentStore();
    const days = [
        'Lun 12',
        'Mar 13',
        'Mié 14',
        'Jue 15',
        'Vie 16',
        'Sáb 17',
        'Dom 18',
    ];
    const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

    const { refetch, isFetching } = useQuery({
        queryKey: ["calendar-appointments"],
        queryFn: async () => {
            await fetchAppointments({ page: 1, limit: 200 });
            return true;
        },
    });

    const calendarAppointments = useMemo(() => {
        const palette = [
            'bg-emerald-100 border-emerald-300 text-emerald-800',
            'bg-blue-100 border-blue-300 text-blue-800',
            'bg-purple-100 border-purple-300 text-purple-800',
            'bg-rose-100 border-rose-300 text-rose-800',
            'bg-amber-100 border-amber-300 text-amber-800',
        ];

        return (storeAppointments as Appointment[]).map((appointment, index) => {
            const [hour = 8, minute = 0] = (appointment.hour || '08:00')
                .split(':')
                .slice(0, 2)
                .map((part) => Number(part));
            const startHour = hour + minute / 60;

            const dateValue = appointment.date
                ? new Date(`${appointment.date}T00:00:00`)
                : new Date();
            const dayIndex = (dateValue.getDay() + 6) % 7;

            const endDate = appointment.end_date ? new Date(appointment.end_date) : null;
            const durationFromEndDate =
                endDate && !Number.isNaN(endDate.getTime())
                    ? (endDate.getHours() + endDate.getMinutes() / 60) - startHour
                    : null;
            const duration =
                durationFromEndDate && durationFromEndDate > 0
                    ? durationFromEndDate
                    : Math.max(0.5, (appointment.service?.minutes_duration || 60) / 60);

            const clientFullName = appointment.client?.name || 'Cliente';
            const nameParts = clientFullName.split(' ').filter(Boolean);
            const shortClientName =
                nameParts.length > 1
                    ? `${nameParts[0]} ${nameParts[1].charAt(0)}.`
                    : clientFullName;

            return {
                id: appointment.id,
                day: Math.max(0, Math.min(dayIndex, days.length - 1)),
                startHour,
                duration,
                client: shortClientName,
                service: appointment.service?.name?.split(' ')[0] || 'Servicio',
                color: palette[index % palette.length],
            };
        });
    }, [storeAppointments, days.length]);

    const [view, setView] = useState<'semana' | 'dia'>('semana');
    return (
        <SidebarLayout>
            <PageLayout
                title="Calendario"
                subtitle="Octubre 2026"
                showDate={true}
                dateToolbar={
                    <div className="flex items-center space-x-4">
                        <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                            <button
                                onClick={() => setView('semana')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'semana' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Semana
                            </button>
                            <button
                                onClick={() => setView('dia')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'dia' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Día
                            </button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-slate-600 transition-colors">
                                <ChevronLeftIcon className="w-5 h-5" />
                            </button>
                            <button className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-slate-600 transition-colors">
                                Hoy
                            </button>
                            <button className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-slate-600 transition-colors">
                                <ChevronRightIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors shadow-sm"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Nueva Cita
                        </button>
                    </div>
                }
            >
                <div className="h-[calc(100vh-8rem)] flex flex-col min-h-screen mb-8">
                    <Calendar days={days} hours={hours} appointments={calendarAppointments} />
                    <DateForm
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onCreated={() => {
                            void refetch();
                        }}
                    />
                    {isFetching && (
                        <p className="mt-3 text-sm text-slate-500">Actualizando citas...</p>
                    )}
                </div>
            </PageLayout>
        </SidebarLayout>
    );
}