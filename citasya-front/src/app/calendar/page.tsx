"use client";
import React, { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { Modal } from "@/components/ui/Modal";
import DateForm from "@/components/form/DateForm";
import Calendar from "@/components/ui/Calendar";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react";

export default function CalendarPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
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
    const [appointments, setAppointments] = useState([
        {
            id: 1,
            day: 0,
            startHour: 10,
            duration: 1.5,
            client: 'María G.',
            service: 'Masaje',
            color: 'bg-emerald-100 border-emerald-300 text-emerald-800',
        },
        {
            id: 2,
            day: 1,
            startHour: 11.5,
            duration: 1,
            client: 'Carlos R.',
            service: 'Facial',
            color: 'bg-blue-100 border-blue-300 text-blue-800',
        },
        {
            id: 3,
            day: 2,
            startHour: 9,
            duration: 2,
            client: 'Elena T.',
            service: 'Spa Day',
            color: 'bg-purple-100 border-purple-300 text-purple-800',
        },
        {
            id: 4,
            day: 3,
            startHour: 14,
            duration: 1,
            client: 'Patricia V.',
            service: 'Manicure',
            color: 'bg-rose-100 border-rose-300 text-rose-800',
        },
        {
            id: 5,
            day: 4,
            startHour: 16,
            duration: 1.5,
            client: 'Roberto D.',
            service: 'Masaje',
            color: 'bg-emerald-100 border-emerald-300 text-emerald-800',
        },
        {
            id: 6,
            day: 0,
            startHour: 15,
            duration: 1,
            client: 'Lucía M.',
            service: 'Pedicure',
            color: 'bg-amber-100 border-amber-300 text-amber-800',
        },
    ]);
    // Mock data for dropdowns
    const mockClients = [
        'María González',
        'Carlos Ruiz',
        'Elena Torres',
        'Patricia Vega',
        'Roberto Díaz',
    ];
    const mockServices = [
        'Limpieza Facial',
        'Masaje Relajante',
        'Manicure Spa',
        'Pedicure Spa',
        'Exfoliación',
    ];
    const mockWorkers = ['Ana Silva', 'Laura Gómez', 'Sofía Paz', 'Carlos Mora'];
    const [formData, setFormData] = useState({
        client: '',
        service: '',
        worker: '',
        date: '',
        time: '10:00',
        notes: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name])
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};
        if (!formData.client) newErrors.client = 'Requerido';
        if (!formData.service) newErrors.service = 'Requerido';
        if (!formData.worker) newErrors.worker = 'Requerido';
        if (!formData.date) newErrors.date = 'Requerido';
        if (!formData.time) newErrors.time = 'Requerido';
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        // Simple logic to place the new appointment on the calendar mock visually
        // In a real app, this would use actual dates. Here we just pick a random day 0-4
        const startHourNum =
            parseInt(formData.time.split(':')[0]) +
            parseInt(formData.time.split(':')[1]) / 60;
        const newApt = {
            id: Math.max(...appointments.map((a) => a.id)) + 1,
            day: Math.floor(Math.random() * 5),
            startHour: startHourNum,
            duration: 1,
            client:
                formData.client.split(' ')[0] +
                ' ' +
                formData.client.split(' ')[1]?.charAt(0) +
                '.',
            service: formData.service.split(' ')[0],
            color: 'bg-blue-100 border-blue-300 text-blue-800', // Default color for new
        };
        setAppointments([...appointments, newApt]);
        setIsModalOpen(false);
        setFormData({
            client: '',
            service: '',
            worker: '',
            date: '',
            time: '10:00',
            notes: '',
        });
    };

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
                    <Calendar days={days} hours={hours} appointments={appointments} />
                    <Modal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        title="Nueva Cita"
                        onSubmit={handleSubmit}
                        submitLabel="Agendar Cita"
                    >
                        <DateForm
                            initialValues={formData}
                            errors={errors}
                            onChange={handleInputChange}
                            mockClients={mockClients}
                            mockServices={mockServices}
                            mockWorkers={mockWorkers}
                        />
                    </Modal>
                </div>
            </PageLayout>
        </SidebarLayout>
    );
}