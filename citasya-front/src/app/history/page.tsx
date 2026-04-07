"use client";
import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HistoryTable } from "@/components/ui/HistoryTable";
import PageLayout from "@/components/layout/PageLayout";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { useAppointmentStore } from "@/store/appointmentStore";
import { Appointment } from "@/interfaces/appointment";

const STATUS_MAP: Record<string, string> = {
    scheduled: "completada",
    completed: "completada",
    cancelled: "cancelada",
    canceled: "cancelada",
    no_show: "no_asistio",
};

export default function HistoryPage() {
    const { appointments: storeAppointments, fetchAppointments } = useAppointmentStore();
    const [searchTerm, setSearchTerm] = useState("");

    useQuery({
        queryKey: ["history-page-appointments"],
        queryFn: async () => {
            await fetchAppointments({ page: 1, limit: 200 });
            return true;
        },
    });

    const history = useMemo(() => {
        return (storeAppointments as Appointment[]).map((appointment) => {
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

            const normalizedStatus =
                STATUS_MAP[appointment.status?.toLowerCase?.() || ""] || "completada";

            return {
                id: `C-${appointment.id}`,
                date: displayDate,
                time: displayTime,
                client: appointment.client?.name || "Cliente",
                service: appointment.service?.name || "Servicio",
                specialist: appointment.worker?.name || "Especialista",
                status: normalizedStatus,
                amount: `$${Number(appointment.service?.price || 0).toFixed(2)}`,
            };
        });
    }, [storeAppointments]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completada":
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        Completada
                    </span>
                );
            case "cancelada":
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                        Cancelada
                    </span>
                );
            case "no_asistio":
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        No Asistió
                    </span>
                );
            default:
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {status}
                    </span>
                );
        }
    };

    return (
        <SidebarLayout>
            <PageLayout
                title="Historial de citas"
                subtitle="Revisa el historial completo de tus citas pasadas, con detalles de cada una."
            >
                <div className="max-w-7xl mx-auto mb-8">
        

                    <HistoryTable
                        data={history}
                        getStatusBadge={getStatusBadge}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                    />
                </div>
            </PageLayout>
        </SidebarLayout>
    );
}