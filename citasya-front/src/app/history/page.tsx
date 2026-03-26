"use client";
import React, { useState } from "react";
import { HistoryTable } from "@/components/ui/HistoryTable";
import PageLayout from "@/components/layout/PageLayout";
import SidebarLayout from "@/components/layout/SidebarLayout";

export default function HistoryPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const history = [
        {
            id: "C-1042",
            date: "12 Oct 2026",
            time: "10:00 AM",
            client: "María González",
            service: "Masaje Relajante",
            specialist: "Ana Silva",
            status: "completada",
            amount: "$45.00",
        },
        {
            id: "C-1041",
            date: "12 Oct 2026",
            time: "09:00 AM",
            client: "Carlos Ruiz",
            service: "Limpieza Facial",
            specialist: "Laura Gómez",
            status: "completada",
            amount: "$60.00",
        },
        {
            id: "C-1040",
            date: "11 Oct 2026",
            time: "04:30 PM",
            client: "Elena Torres",
            service: "Manicure Spa",
            specialist: "Sofía Paz",
            status: "cancelada",
            amount: "$25.00",
        },
        {
            id: "C-1039",
            date: "11 Oct 2026",
            time: "02:00 PM",
            client: "Patricia Vega",
            service: "Exfoliación Corporal",
            specialist: "Ana Silva",
            status: "completada",
            amount: "$55.00",
        },
        {
            id: "C-1038",
            date: "10 Oct 2026",
            time: "11:00 AM",
            client: "Roberto Díaz",
            service: "Masaje Descontracturante",
            specialist: "Carlos Mora",
            status: "completada",
            amount: "$50.00",
        },
        {
            id: "C-1037",
            date: "10 Oct 2026",
            time: "09:30 AM",
            client: "Lucía Méndez",
            service: "Pedicure Spa",
            specialist: "Sofía Paz",
            status: "completada",
            amount: "$30.00",
        },
        {
            id: "C-1036",
            date: "09 Oct 2026",
            time: "03:00 PM",
            client: "Javier López",
            service: "Limpieza Facial",
            specialist: "Laura Gómez",
            status: "no_asistio",
            amount: "$60.00",
        },
        {
            id: "C-1035",
            date: "09 Oct 2026",
            time: "01:00 PM",
            client: "Carmen Ortiz",
            service: "Masaje Piedras",
            specialist: "Carlos Mora",
            status: "completada",
            amount: "$70.00",
        },
    ];

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