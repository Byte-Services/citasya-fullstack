/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { motion } from "framer-motion";
import {
    MailIcon,
    PhoneIcon,
    StarIcon,
    CalendarIcon,
    Edit2Icon,
    Trash2Icon,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function WorkersPage() {
    // Modals state
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    // Selection state
    const [selectedWorker, setSelectedWorker] = useState<any>(null);
    const [editingWorkerId, setEditingWorkerId] = useState<number | null>(null);
    const [workers, setWorkers] = useState([
        {
            id: 1,
            name: 'Ana Silva',
            role: 'Masajista Principal',
            email: 'ana.s@spa.com',
            phone: '+34 611 222 333',
            status: 'Activo',
            rating: 4.9,
            services: ['Masajes', 'Corporales'],
            schedule: 'Lun - Vie, 09:00 - 18:00',
            selectedDays: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
            startTime: '09:00',
            endTime: '18:00',
        },
        {
            id: 2,
            name: 'Laura Gómez',
            role: 'Cosmetóloga',
            email: 'laura.g@spa.com',
            phone: '+34 622 333 444',
            status: 'Activo',
            rating: 4.8,
            services: ['Faciales'],
            schedule: 'Mar - Sáb, 10:00 - 19:00',
            selectedDays: ['Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
            startTime: '10:00',
            endTime: '19:00',
        },
        {
            id: 3,
            name: 'Sofía Paz',
            role: 'Manicurista',
            email: 'sofia.p@spa.com',
            phone: '+34 633 444 555',
            status: 'Activo',
            rating: 4.7,
            services: ['Uñas'],
            schedule: 'Lun - Sáb, 09:00 - 15:00',
            selectedDays: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
            startTime: '09:00',
            endTime: '15:00',
        },
        {
            id: 4,
            name: 'Carlos Mora',
            role: 'Terapeuta Físico',
            email: 'carlos.m@spa.com',
            phone: '+34 644 555 666',
            status: 'Inactivo',
            rating: 4.9,
            services: ['Masajes'],
            schedule: 'Jue - Dom, 10:00 - 20:00',
            selectedDays: ['Jue', 'Vie', 'Sáb', 'Dom'],
            startTime: '10:00',
            endTime: '20:00',
        },
        {
            id: 5,
            name: 'Elena Rojas',
            role: 'Esteticista',
            email: 'elena.r@spa.com',
            phone: '+34 655 666 777',
            status: 'Activo',
            rating: 4.6,
            services: ['Faciales', 'Corporales'],
            schedule: 'Lun - Vie, 11:00 - 20:00',
            selectedDays: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
            startTime: '11:00',
            endTime: '20:00',
        },
    ]);
    const availableSpecialties = ['Faciales', 'Corporales', 'Masajes', 'Uñas'];
    const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        email: '',
        phone: '',
        status: 'Activo',
        specialties: [] as string[],
        selectedDays: [] as string[],
        startTime: '09:00',
        endTime: '18:00',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const containerVariants = {
        hidden: {
            opacity: 0,
        },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };
    const itemVariants = {
        hidden: {
            opacity: 0,
            y: 20,
        },
        show: {
            opacity: 1,
            y: 0,
        },
    };
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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
    const toggleSpecialty = (specialty: string) => {
        setFormData((prev) => {
            const isSelected = prev.specialties.includes(specialty);
            const newSpecialties = isSelected
                ? prev.specialties.filter((s) => s !== specialty)
                : [...prev.specialties, specialty];
            if (errors.specialties && newSpecialties.length > 0) {
                setErrors((e) => ({
                    ...e,
                    specialties: '',
                }));
            }
            return {
                ...prev,
                specialties: newSpecialties,
            };
        });
    };
    const toggleDay = (day: string) => {
        setFormData((prev) => {
            const isSelected = prev.selectedDays.includes(day);
            const newDays = isSelected
                ? prev.selectedDays.filter((d) => d !== day)
                : [...prev.selectedDays, day];
            if (errors.selectedDays && newDays.length > 0) {
                setErrors((e) => ({
                    ...e,
                    selectedDays: '',
                }));
            }
            return {
                ...prev,
                selectedDays: newDays,
            };
        });
    };
    const openNewWorkerModal = () => {
        setEditingWorkerId(null);
        resetForm();
        setIsFormModalOpen(true);
    };
    const openEditWorkerModal = (worker?: any) => {
        const target = worker || selectedWorker;
        if (!target) return;
        setEditingWorkerId(target.id);
        setFormData({
            name: target.name,
            role: target.role,
            email: target.email,
            phone: target.phone,
            status: target.status,
            specialties: target.services,
            selectedDays: target.selectedDays || [],
            startTime: target.startTime || '09:00',
            endTime: target.endTime || '18:00',
        });
        setErrors({});
        setIsProfileOpen(false);
        setIsFormModalOpen(true);
    };
    const openProfile = (worker: any) => {
        setSelectedWorker(worker);
        setIsProfileOpen(true);
    };
    const openDeleteDialog = (worker?: any) => {
        if (worker) setSelectedWorker(worker);
        setIsDeleteDialogOpen(true);
    };
    const handleDeleteConfirm = () => {
        if (selectedWorker) {
            setWorkers((prev) => prev.filter((w) => w.id !== selectedWorker.id));
            setIsDeleteDialogOpen(false);
            setIsProfileOpen(false);
            setSelectedWorker(null);
        }
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Requerido';
        if (!formData.role.trim()) newErrors.role = 'Requerido';
        if (!formData.email.trim()) newErrors.email = 'Requerido';
        if (!formData.phone.trim()) newErrors.phone = 'Requerido';
        if (formData.specialties.length === 0)
            newErrors.specialties = 'Selecciona al menos una especialidad';
        if (formData.selectedDays.length === 0)
            newErrors.selectedDays = 'Selecciona al menos un día';
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        // Format schedule string (e.g., "Lun - Vie, 09:00 - 18:00")
        const sortedDays = daysOfWeek.filter((d) =>
            formData.selectedDays.includes(d),
        );
        let dayString = sortedDays.join(', ');
        if (
            sortedDays.length > 2 &&
            daysOfWeek.indexOf(sortedDays[sortedDays.length - 1]) -
                daysOfWeek.indexOf(sortedDays[0]) ===
                sortedDays.length - 1
        ) {
            dayString = `${sortedDays[0]} - ${sortedDays[sortedDays.length - 1]}`;
        }
        const scheduleStr = `${dayString}, ${formData.startTime} - ${formData.endTime}`;
        const workerData = {
            name: formData.name,
            role: formData.role,
            email: formData.email,
            phone: formData.phone,
            status: formData.status,
            services: formData.specialties,
            schedule: scheduleStr,
            selectedDays: formData.selectedDays,
            startTime: formData.startTime,
            endTime: formData.endTime,
        };
        if (editingWorkerId) {
            // Update existing
            setWorkers(
                workers.map((w) =>
                    w.id === editingWorkerId
                        ? {
                                ...w,
                                ...workerData,
                            }
                        : w,
                ),
            );
            if (selectedWorker && selectedWorker.id === editingWorkerId) {
                setSelectedWorker({
                    ...selectedWorker,
                    ...workerData,
                });
            }
        } else {
            // Add new
            const newWorker = {
                id: Math.max(0, ...workers.map((w) => w.id)) + 1,
                rating: 5.0,
                ...workerData,
            };
            setWorkers([...workers, newWorker]);
        }
        setIsFormModalOpen(false);
    };
    const resetForm = () => {
        setFormData({
            name: '',
            role: '',
            email: '',
            phone: '',
            status: 'Activo',
            specialties: [],
            selectedDays: [],
            startTime: '09:00',
            endTime: '18:00',
        });
        setErrors({});
    };

    return (
        <SidebarLayout>
            <PageLayout
                title="Equipo de Trabajo"
                subtitle="Gestiona a tus especialistas y sus horarios"
                createButtonText="Nuevo trabajador"
                showCreateButton={true}
                onCreateClick={openNewWorkerModal}
            >
                <div className="max-w-7xl mx-auto">
                    

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {workers.map((worker) => (
                            <motion.div
                                key={worker.id}
                                variants={itemVariants}
                                className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden flex flex-col group"
                            >
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-400 border-2 border-white shadow-sm">
                                                {worker.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-800">
                                                    {worker.name}
                                                </h3>
                                                <p className="text-sm text-primary font-medium">
                                                    {worker.role}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openEditWorkerModal(worker);
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                                >
                                                    <Edit2Icon className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openDeleteDialog(worker);
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                                                >
                                                    <Trash2Icon className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-xs font-medium ${worker.status === 'Activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}
                                            >
                                                {worker.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center text-sm text-slate-600">
                                            <MailIcon className="w-5 h-5 mr-3 text-slate-400" />
                                            {worker.email}
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600">
                                            <PhoneIcon className="w-5 h-5 mr-3 text-slate-400" />
                                            {worker.phone}
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600">
                                            <CalendarIcon className="w-5 h-5 mr-3 text-slate-400" />
                                            {worker.schedule}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {worker.services.map((service, index) => (
                                            <span
                                                key={index}
                                                className="px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-md text-xs font-medium text-slate-600"
                                            >
                                                {service}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gray-50/80 px-6 py-4 border-t border-gray-100 flex justify-between items-center mt-auto">
                                    <div className="flex items-center">
                                        <StarIcon className="w-4 h-4 text-amber-400 fill-amber-400 mr-1.5" />
                                        <span className="text-sm font-bold text-slate-800">
                                            {worker.rating}
                                        </span>
                                        <span className="text-xs text-slate-500 ml-1">/ 5.0</span>
                                    </div>
                                    <button
                                        onClick={() => openProfile(worker)}
                                        className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                                    >
                                        Ver perfil
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Form Modal (Add/Edit) */}
                    <Modal
                        isOpen={isFormModalOpen}
                        onClose={() => setIsFormModalOpen(false)}
                        title={editingWorkerId ? 'Editar Trabajador' : 'Agregar Trabajador'}
                        onSubmit={handleSubmit}
                        submitLabel="Guardar"
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Nombre Completo <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-rose-500' : 'border-gray-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Rol / Cargo <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    placeholder="Ej. Masajista"
                                    className={`w-full px-4 py-3 rounded-xl border ${errors.role ? 'border-rose-500' : 'border-gray-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white`}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Email <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-rose-500' : 'border-gray-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Teléfono <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-rose-500' : 'border-gray-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Estado
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                                >
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Especialidades <span className="text-rose-500">*</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {availableSpecialties.map((spec) => (
                                        <button
                                            key={spec}
                                            type="button"
                                            onClick={() => toggleSpecialty(spec)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${formData.specialties.includes(spec) ? 'bg-primary text-white' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'}`}
                                        >
                                            {spec}
                                        </button>
                                    ))}
                                </div>
                                {errors.specialties && (
                                    <p className="mt-1 text-sm text-rose-500">{errors.specialties}</p>
                                )}
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <h3 className="text-sm font-bold text-slate-800 mb-4">
                                    Horario de Trabajo
                                </h3>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Días <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {daysOfWeek.map((day) => (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => toggleDay(day)}
                                                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${formData.selectedDays.includes(day) ? 'bg-primary text-white' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'}`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.selectedDays && (
                                        <p className="mt-1 text-sm text-rose-500">
                                            {errors.selectedDays}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Hora Inicio
                                        </label>
                                        <input
                                            type="time"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Hora Fin
                                        </label>
                                        <input
                                            type="time"
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal>

                    {/* Profile View Modal */}
                    <Modal
                        isOpen={isProfileOpen}
                        onClose={() => setIsProfileOpen(false)}
                        title="Perfil del Trabajador"
                    >
                        {selectedWorker && (
                            <div className="flex flex-col h-full">
                                <div className="flex flex-col items-center mb-8">
                                    <div className="w-24 h-24 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-4xl font-bold mb-4 border-4 border-white shadow-sm">
                                        {selectedWorker.name.charAt(0)}
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-800 mb-1">
                                        {selectedWorker.name}
                                    </h2>
                                    <p className="text-primary font-medium mb-3">
                                        {selectedWorker.role}
                                    </p>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${selectedWorker.status === 'Activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}
                                    >
                                        {selectedWorker.status}
                                    </span>
                                </div>

                                <div className="space-y-6 flex-1">
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">
                                            Contacto
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center text-slate-600">
                                                <MailIcon className="w-5 h-5 mr-3 text-slate-400" />
                                                <span>{selectedWorker.email}</span>
                                            </div>
                                            <div className="flex items-center text-slate-600">
                                                <PhoneIcon className="w-5 h-5 mr-3 text-slate-400" />
                                                <span>{selectedWorker.phone}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">
                                            Horario
                                        </h3>
                                        <div className="flex items-center text-slate-600">
                                            <CalendarIcon className="w-5 h-5 mr-3 text-slate-400" />
                                            <span>{selectedWorker.schedule}</span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                                                Especialidades
                                            </h3>
                                            <div className="flex items-center">
                                                <StarIcon className="w-4 h-4 text-amber-400 fill-amber-400 mr-1" />
                                                <span className="text-sm font-bold text-slate-800">
                                                    {selectedWorker.rating}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedWorker.services.map(
                                                (service: string, index: number) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-slate-600 shadow-sm"
                                                    >
                                                        {service}
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-100 flex space-x-3">
                                    <button
                                        onClick={openEditWorkerModal}
                                        className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-lg font-medium border border-primary text-primary hover:bg-primary/5 transition-colors"
                                    >
                                        <Edit2Icon className="w-4 h-4 mr-2" />
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => openDeleteDialog()}
                                        className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-lg font-medium border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                                    >
                                        <Trash2Icon className="w-4 h-4 mr-2" />
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        )}
                    </Modal>

                    {/* Delete Confirmation */}
                    <ConfirmDialog
                        isOpen={isDeleteDialogOpen}
                        onClose={() => setIsDeleteDialogOpen(false)}
                        onConfirm={handleDeleteConfirm}
                        title="¿Eliminar trabajador?"
                        message="Esta acción no se puede deshacer. Se eliminará permanentemente del equipo."
                    />
                </div>
            </PageLayout>
        </SidebarLayout>
    );
}