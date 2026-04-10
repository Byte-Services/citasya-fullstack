"use client";
import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HistoryStatus, HistoryTable } from "@/components/ui/HistoryTable";
import PageLayout from "@/components/layout/PageLayout";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { useAppointmentStore } from "@/store/appointmentStore";
import { Appointment } from "@/interfaces/appointment";
import { getTimelineState } from "@/utils/appointmentTimeline";

const STATUS_MAP: Record<string, HistoryStatus> = {
    pendiente: "programada",
    confirmado: "programada",
    scheduled: "programada",
    en_progreso: "en_progreso",
    in_progress: "en_progreso",
    concluida: "completada",
    completada: "completada",
    completed: "completada",
    cancelado: "cancelada",
    cancelada: "cancelada",
    cancelled: "cancelada",
    canceled: "cancelada",
    no_show: "no_asistio",
    no_asistio: "no_asistio",
};

const TO_BACKEND_STATUS: Record<HistoryStatus, "Pendiente" | "Confirmado" | "Cancelado" | "Concluida"> = {
    programada: "Confirmado",
    en_progreso: "Confirmado",
    completada: "Concluida",
    cancelada: "Cancelado",
    no_asistio: "Cancelado",
};

export default function HistoryPage() {
    const {
        appointments: storeAppointments,
        fetchAppointments,
        updateAppointment,
    } = useAppointmentStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

    useQuery({
        queryKey: ["history-page-appointments"],
        queryFn: async () => {
            await fetchAppointments({ page: 1, limit: 200 });
            return true;
        },
    });

    const history = useMemo(() => {
        return (storeAppointments as Appointment[])
            .sort((a, b) => {
                const aValue = `${a.date}T${a.hour || "00:00"}`;
                const bValue = `${b.date}T${b.hour || "00:00"}`;
                return new Date(bValue).getTime() - new Date(aValue).getTime();
            })
            .map((appointment) => {
            const appointmentDate = appointment.date
                ? new Date(`${appointment.date}T00:00:00`)
                : new Date();

            const displayDate = appointmentDate.toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });

            const [hourPart = 0, minutePart = 0] = (appointment.hour || "00:00")
                .split(":")
                .slice(0, 2)
                .map((part) => Number(part));
            const timeDate = new Date();
            timeDate.setHours(hourPart, minutePart, 0, 0);
            const displayTime = timeDate.toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
            });

            const normalizedStatus = STATUS_MAP[appointment.status?.toLowerCase?.() || ""] || "programada";
            const timelineState = getTimelineState(appointment);
            const displayStatus: HistoryStatus =
                timelineState === "past" &&
                (normalizedStatus === "programada" || normalizedStatus === "en_progreso")
                    ? "completada"
                    : normalizedStatus;

            return {
                appointmentId: appointment.id,
                id: `C-${appointment.id}`,
                date: displayDate,
                time: displayTime,
                client: appointment.client?.name || "Cliente",
                service: appointment.service?.name || "Servicio",
                specialist: appointment.worker?.name || "Especialista",
                status: displayStatus,
                amount: `$${Number(appointment.service?.price || 0).toFixed(2)}`,
            };
            });
    }, [storeAppointments]);

    const handleStatusChange = async (appointmentId: number, nextStatus: HistoryStatus) => {
        setUpdatingStatusId(appointmentId);
        try {
            await updateAppointment(appointmentId, {
                status: TO_BACKEND_STATUS[nextStatus],
            });
            await fetchAppointments({ page: 1, limit: 200 });
        } finally {
            setUpdatingStatusId(null);
        }
    };

    return (
        <SidebarLayout>
            <PageLayout
                title="Historial de citas"
                subtitle="Revisa el historial completo de tus citas pasadas, con detalles de cada una."
            >
                <div className="w-full max-w-screen-2xl mx-auto mb-8">
        

                    <HistoryTable
                        data={history}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        onStatusChange={handleStatusChange}
                        updatingStatusId={updatingStatusId}
                    />
                </div>
            </PageLayout>
        </SidebarLayout>
    );
}