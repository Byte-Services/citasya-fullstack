"use client";
import React, { useState } from "react";
// ...existing code...
import {
    MailIcon,
    PhoneIcon,
    CalendarIcon,
    Edit2Icon,
    Trash2Icon,
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Table } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
type Client = {
    id: number;
    name: string;
    email: string;
    phone: string;
    lastVisit: string;
    visits: number;
    status: string;
    notes?: string;
};

export default function ClientsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    // Modals state
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    // Selection state
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [editingClientId, setEditingClientId] = useState<number | null>(null);
    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        notes: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [clients, setClients] = useState([
        {
            id: 1,
            name: "María González",
            email: "maria.g@email.com",
            phone: "+34 612 345 678",
            lastVisit: "12 Oct 2026",
            visits: 12,
            status: "Frecuente",
            notes: "Prefiere masajes descontracturantes fuertes.",
        },
        {
            id: 2,
            name: "Carlos Ruiz",
            email: "cruiz@email.com",
            phone: "+34 623 456 789",
            lastVisit: "12 Oct 2026",
            visits: 3,
            status: "Regular",
            notes: "",
        },
        {
            id: 3,
            name: "Elena Torres",
            email: "elena.t@email.com",
            phone: "+34 634 567 890",
            lastVisit: "11 Oct 2026",
            visits: 1,
            status: "Nuevo",
            notes: "Alergia a productos con almendras.",
        },
        {
            id: 4,
            name: "Patricia Vega",
            email: "pvega@email.com",
            phone: "+34 645 678 901",
            lastVisit: "11 Oct 2026",
            visits: 8,
            status: "Frecuente",
            notes: "",
        },
        {
            id: 5,
            name: "Roberto Díaz",
            email: "roberto.d@email.com",
            phone: "+34 656 789 012",
            lastVisit: "10 Oct 2026",
            visits: 5,
            status: "Regular",
            notes: "",
        },
        {
            id: 6,
            name: "Lucía Méndez",
            email: "lucia.m@email.com",
            phone: "+34 667 890 123",
            lastVisit: "10 Oct 2026",
            visits: 15,
            status: "VIP",
            notes: "Clienta VIP, ofrecer siempre bebida de cortesía.",
        },
        {
            id: 7,
            name: "Javier López",
            email: "jlopez@email.com",
            phone: "+34 678 901 234",
            lastVisit: "09 Oct 2026",
            visits: 2,
            status: "Nuevo",
            notes: "",
        },
        {
            id: 8,
            name: "Carmen Ortiz",
            email: "carmen.o@email.com",
            phone: "+34 689 012 345",
            lastVisit: "09 Oct 2026",
            visits: 6,
            status: "Regular",
            notes: "",
        },
    ]);

    const containerVariants = {
        hidden: {
            opacity: 0,
        },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
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
    const getStatusColor = (status: string) => {
        switch (status) {
            case "VIP":
                return "bg-purple-100 text-purple-700";
            case "Frecuente":
                return "bg-emerald-100 text-emerald-700";
            case "Nuevo":
                return "bg-blue-100 text-blue-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name])
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
    };
    const openNewClientModal = () => {
        setEditingClientId(null);
        setFormData({
            name: "",
            email: "",
            phone: "",
            notes: "",
        });
        setErrors({});
        setIsFormModalOpen(true);
    };
    const openEditClientModal = () => {
        if (!selectedClient) return;
        setEditingClientId(selectedClient.id);
        setFormData({
            name: selectedClient.name,
            email: selectedClient.email,
            phone: selectedClient.phone,
            notes: selectedClient.notes || "",
        });
        setErrors({});
        setIsProfileOpen(false);
        setIsFormModalOpen(true);
    };
    const openProfile = (client: Client) => {
        setSelectedClient(client);
        setIsProfileOpen(true);
    };
    const handleDeleteConfirm = () => {
        if (selectedClient) {
            setClients(clients.filter((c) => c.id !== selectedClient.id));
            setIsProfileOpen(false);
            setSelectedClient(null);
        }
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Validation
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = "El nombre es requerido";
        if (!formData.email.trim()) newErrors.email = "El email es requerido";
        if (!formData.phone.trim()) newErrors.phone = "El teléfono es requerido";
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        if (editingClientId) {
            // Update existing
            setClients(
                clients.map((c) =>
                    c.id === editingClientId
                        ? {
                                ...c,
                                name: formData.name,
                                email: formData.email,
                                phone: formData.phone,
                                notes: formData.notes,
                            }
                        : c,
                ),
            );
            // Update selected client if profile is reopened
            if (selectedClient && selectedClient.id === editingClientId) {
                setSelectedClient({
                    ...selectedClient,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    notes: formData.notes,
                });
            }
        } else {
            // Add new
            const today = new Date().toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
            const newClient = {
                id: Math.max(0, ...clients.map((c) => c.id)) + 1,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                notes: formData.notes,
                lastVisit: today,
                visits: 0,
                status: "Nuevo",
            };
            setClients([newClient, ...clients]);
        }
        setIsFormModalOpen(false);
    };

    return (
        <SidebarLayout>
            <PageLayout title="Directorio de Clientes" subtitle="Gestiona la información de tus clientes." createButtonText="Nuevo cliente" showCreateButton={true} onCreateClick={openNewClientModal}>
                <div className="max-w-7xl mx-auto mb-8">
                    

                

                    <Table clients={clients} onProfile={openProfile} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

                    {/* Form Modal (Add/Edit) */}
                    <Modal
                        isOpen={isFormModalOpen}
                        onClose={() => setIsFormModalOpen(false)}
                        title={editingClientId ? "Editar Cliente" : "Nuevo Cliente"}
                        onSubmit={handleSubmit}
                        submitLabel={editingClientId ? "Guardar Cambios" : "Registrar Cliente"}
                    >
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Nombre Completo <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Ej. Ana Martínez"
                                className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-rose-500 focus:ring-rose-500/20' : 'border-gray-200 focus:border-primary focus:ring-primary/20'} focus:ring-2 outline-none transition-all bg-white`}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-rose-500">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Correo Electrónico <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="ana@ejemplo.com"
                                className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-rose-500 focus:ring-rose-500/20' : 'border-gray-200 focus:border-primary focus:ring-primary/20'} focus:ring-2 outline-none transition-all bg-white`}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-rose-500">{errors.email}</p>
                            )}
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
                                placeholder="+34 600 000 000"
                                className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-rose-500 focus:ring-rose-500/20' : 'border-gray-200 focus:border-primary focus:ring-primary/20'} focus:ring-2 outline-none transition-all bg-white`}
                            />
                            {errors.phone && (
                                <p className="mt-1 text-sm text-rose-500">{errors.phone}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Notas (Opcional)
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                placeholder="Alergias, preferencias, etc."
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white resize-none"
                            />
                        </div>
                    </Modal>

                    {/* Profile View Modal */}
                    <Modal
                        isOpen={isProfileOpen}
                        onClose={() => setIsProfileOpen(false)}
                        title="Perfil del Cliente"
                    >
                        {selectedClient && (
                            <div className="flex flex-col h-full">
                                <div className="flex flex-col items-center mb-8">
                                    <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-4xl font-bold mb-4 border-4 border-white shadow-sm">
                                        {selectedClient.name.charAt(0)}
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-800 mb-2">
                                        {selectedClient.name}
                                    </h2>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedClient.status)}`}
                                    >
                                        {selectedClient.status}
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
                                                <span>{selectedClient.email}</span>
                                            </div>
                                            <div className="flex items-center text-slate-600">
                                                <PhoneIcon className="w-5 h-5 mr-3 text-slate-400" />
                                                <span>{selectedClient.phone}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">
                                            Actividad
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Última Visita</p>
                                                <p className="font-medium text-slate-800 flex items-center">
                                                    <CalendarIcon className="w-4 h-4 mr-1.5 text-slate-400" />
                                                    {selectedClient.lastVisit}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Total Citas</p>
                                                <p className="font-medium text-slate-800">
                                                    {selectedClient.visits} citas
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedClient.notes && (
                                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                                            <h3 className="text-sm font-bold text-amber-800 mb-2 uppercase tracking-wider">
                                                Notas
                                            </h3>
                                            <p className="text-amber-700 text-sm leading-relaxed">
                                                {selectedClient.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-100 flex space-x-3">
                                    <button
                                        onClick={openEditClientModal}
                                        className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-lg font-medium border border-primary text-primary hover:bg-primary/5 transition-colors"
                                    >
                                        <Edit2Icon className="w-4 h-4 mr-2" />
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => setIsDeleteDialogOpen(true)}
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
                        title="¿Eliminar cliente?"
                        message="Esta acción no se puede deshacer. Se eliminará permanentemente del directorio."
                    />
                </div>
            </PageLayout>
        </SidebarLayout>
    );
}