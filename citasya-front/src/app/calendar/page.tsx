"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import PageLayout from "@/components/layout/PageLayout";
import SidebarLayout from "@/components/layout/SidebarLayout";
import DateForm from "@/components/form/DateForm";
import Calendar from "@/components/ui/Calendar";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react";
import { useAppointmentStore } from "@/store/appointmentStore";
import { Appointment } from "@/interfaces/appointment";

// this page show the calendar UI, it just only to test
function CalendarPageContent() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [view, setView] = useState<'semana' | 'dia'>('semana');
    const [anchorDate, setAnchorDate] = useState(() => new Date());
    const searchParams = useSearchParams();
    const { appointments: storeAppointments, fetchAppointments } = useAppointmentStore();

    useEffect(() => {
        if (searchParams.get('new') === '1') {
            setIsModalOpen(true);
        }
    }, [searchParams]);
// secondary builder
    const startOfWeek = (date: Date) => {
        const result = new Date(date);
        const day = result.getDay();
        const diffToMonday = (day + 6) % 7;
        result.setDate(result.getDate() - diffToMonday);
        result.setHours(0, 0, 0, 0);
        return result;
    };

    const formatDayLabel = (date: Date) => {
        const weekday = new Intl.DateTimeFormat('es-ES', { weekday: 'short' })
            .format(date)
            .replace('.', '');
        const normalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
        const dayNumber = new Intl.DateTimeFormat('es-ES', { day: '2-digit' }).format(date);
        return `${normalizedWeekday} ${dayNumber}`;
    };

    const visibleDates = useMemo(() => {
        if (view === 'dia') {
            const onlyDay = new Date(anchorDate);
            onlyDay.setHours(0, 0, 0, 0);
            return [onlyDay];
        }

        const monday = startOfWeek(anchorDate);
        return Array.from({ length: 7 }, (_, index) => {
            const date = new Date(monday);
            date.setDate(monday.getDate() + index);
            return date;
        });
    }, [anchorDate, view]);

    const days = useMemo(() => visibleDates.map(formatDayLabel), [visibleDates]);

    const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

    const dateToKey = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

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

        const visibleDayMap = new Map<string, number>(
            visibleDates.map((date, index) => [dateToKey(date), index]),
        );

        return (storeAppointments as Appointment[])
            .map((appointment, index) => {
            const [hour = 8, minute = 0] = (appointment.hour || '08:00')
                .split(':')
                .slice(0, 2)
                .map((part) => Number(part));
            const startHour = hour + minute / 60;

            const appointmentDate = appointment.date
                ? new Date(`${appointment.date}T00:00:00`)
                : null;

            if (!appointmentDate || Number.isNaN(appointmentDate.getTime())) {
                return null;
            }

            const dayIndex = visibleDayMap.get(dateToKey(appointmentDate));
            if (dayIndex === undefined) {
                return null;
            }

            const duration = Math.max(0.5, (appointment.service?.minutes_duration || 60) / 60);

            const clientFullName = appointment.client?.name || 'Cliente';
            const nameParts = clientFullName.split(' ').filter(Boolean);
            const shortClientName =
                nameParts.length > 1
                    ? `${nameParts[0]} ${nameParts[1].charAt(0)}.`
                    : clientFullName;

            return {
                id: appointment.id,
                day: dayIndex,
                startHour,
                duration,
                client: shortClientName,
                service: appointment.service?.name || 'Servicio',
                worker: appointment.worker?.name || 'Trabajador',
                color: palette[index % palette.length],
            };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);
    }, [storeAppointments, visibleDates]);

    const toolbarSubtitle = useMemo(() => {
        if (visibleDates.length === 1) {
            return new Intl.DateTimeFormat('es-ES', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            }).format(visibleDates[0]);
        }

        const start = visibleDates[0];
        const end = visibleDates[visibleDates.length - 1];
        const startText = new Intl.DateTimeFormat('es-ES', {
            day: '2-digit',
            month: 'short',
        }).format(start);
        const endText = new Intl.DateTimeFormat('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(end);

        return `${startText} - ${endText}`;
    }, [visibleDates]);

    const moveBackward = () => {
        setAnchorDate((current) => {
            const next = new Date(current);
            next.setDate(current.getDate() - (view === 'dia' ? 1 : 7));
            return next;
        });
    };

    const moveForward = () => {
        setAnchorDate((current) => {
            const next = new Date(current);
            next.setDate(current.getDate() + (view === 'dia' ? 1 : 7));
            return next;
        });
    };

    const todayDayIndex = useMemo(() => {
        const todayKey = dateToKey(new Date());
        return visibleDates.findIndex((date) => dateToKey(date) === todayKey);
    }, [visibleDates]);

    return (
        <SidebarLayout>
            <PageLayout
                title="Calendario"
                subtitle={toolbarSubtitle}
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
                            <button
                                onClick={moveBackward}
                                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-slate-600 transition-colors"
                            >
                                <ChevronLeftIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setAnchorDate(new Date())}
                                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-slate-600 transition-colors"
                            >
                                Hoy
                            </button>
                            <button
                                onClick={moveForward}
                                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-slate-600 transition-colors"
                            >
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
                    <Calendar
                        days={days}
                        hours={hours}
                        appointments={calendarAppointments}
                        highlightDayIndex={todayDayIndex >= 0 ? todayDayIndex : null}
                    />
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

export default function CalendarPage() {
    return (
        <Suspense>
            <CalendarPageContent />
        </Suspense>
    );
}