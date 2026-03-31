"use client";
import React, { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ClientProfileModal } from "@/components/ui/ClientProfileModal";
import ClientForm from "@/components/form/ClientForm";
import { Client } from "@/interfaces/client";
import { Table } from "@/components/ui/Table";



export default function ClientsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    // Modals state
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    // Selection state
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [editingClientId, setEditingClientId] = useState<number | null>(null);
    const [data, setData] = useState<Client[]>([]);

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
    const openNewClientModal = () => {
        setEditingClientId(null);
        setIsFormModalOpen(true);
    };
    const openEditClientModal = () => {
        if (!selectedClient) return;
        setEditingClientId(selectedClient.id);
        setIsProfileOpen(false);
        setIsFormModalOpen(true);
    };
    const openProfile = (client: Client) => {
        setSelectedClient(client);
        setIsProfileOpen(true);
    };
    const handleDeleteConfirm = () => {
        if (selectedClient) {
            setData(data.filter((c) => c.id !== selectedClient.id));
            setIsProfileOpen(false);
            setSelectedClient(null);
        }
    };
    // La lógica de creación/edición de clientes se maneja ahora dentro de ClientForm

    return (
        <SidebarLayout>
            <PageLayout title="Directorio de Clientes" subtitle="Gestiona la información de tus clientes." createButtonText="Nuevo cliente" showCreateButton={true} onCreateClick={openNewClientModal}>
                <div className="max-w-7xl mx-auto mb-8">
                    

                

                    <Table
                        data={data}
                        onRowClick={openProfile}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                    />

                    {/* Form Modal (Add/Edit) */}
                    <ClientForm
                        isOpen={isFormModalOpen}
                        onClose={() => setIsFormModalOpen(false)}
                        title={editingClientId ? "Editar Cliente" : "Nuevo Cliente"}
                        submitLabel={editingClientId ? "Guardar Cambios" : "Registrar Cliente"}
                        initialValues={editingClientId && selectedClient ? {
                            name: selectedClient.name || "",
                            documentId: selectedClient.documentId || "",
                            phone: selectedClient.phone || "",
                            notes: selectedClient.notes || "",
                            id: selectedClient.id,
                        } : {
                            name: "",
                            documentId: "",
                            phone: "",
                            notes: "",
                        }}
                        centerId={1}
                    />

                    {/* Profile View Modal */}
                    <ClientProfileModal
                        isOpen={isProfileOpen}
                        onClose={() => setIsProfileOpen(false)}
                        client={selectedClient}
                        onEdit={openEditClientModal}
                        onDelete={() => setIsDeleteDialogOpen(true)}
                        getStatusColor={getStatusColor}
                    />

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