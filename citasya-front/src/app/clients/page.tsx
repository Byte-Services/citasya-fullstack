"use client";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import PageLayout from "@/components/layout/PageLayout";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ClientProfileModal } from "@/components/ui/ClientProfileModal";
import ClientForm from "@/components/form/ClientForm";
import { Client } from "@/interfaces/client";
import { Table } from "@/components/ui/Table";
import { useClientStore } from "@/store/clientStore";
import Toast from "@/components/ui/Toast";

type ClientView = Client & {
    status: string;
    lastVisit: string;
    visits: number;
};


export default function ClientsPage() {
    const { clients, fetchClients, deleteClient } = useClientStore();
    const searchParams = useSearchParams();

    const [searchTerm, setSearchTerm] = useState("");
    // Modals state
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    // Selection state
    const [selectedClient, setSelectedClient] = useState<ClientView | null>(null);
    const [editingClientId, setEditingClientId] = useState<number | null>(null);
    const [toast, setToast] = useState<{
        open: boolean;
        type: "success" | "error";
        message: string;
    }>({
        open: false,
        type: "success",
        message: "",
    });

    const { refetch } = useQuery({
        queryKey: ["clients-page-data"],
        queryFn: async () => {
            await fetchClients({ page: 1, limit: 200 });
            return true;
        },
    });

    const deleteClientMutation = useMutation({
        mutationFn: async (id: number) => {
            await deleteClient(id);
        },
        onSuccess: async () => {
            await refetch();
        },
    });

    const data: ClientView[] = (clients as Client[]).map((client) => ({
        ...client,
        status: "Regular",
        lastVisit: "-",
        visits: 0,
    }));

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
    const openProfile = (client: ClientView) => {
        setSelectedClient(client);
        setIsProfileOpen(true);
    };

    useEffect(() => {
        if (searchParams.get("new") === "1") {
            setEditingClientId(null);
            setIsFormModalOpen(true);
        }
    }, [searchParams]);

    const handleDeleteConfirm = () => {
        if (selectedClient) {
            deleteClientMutation.mutate(selectedClient.id);
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
                            email: selectedClient.email || "",
                            notes: selectedClient.notes || "",
                            id: selectedClient.id,
                        } : {
                            name: "",
                            documentId: "",
                            phone: "",
                            email: "",
                            notes: "",
                        }}
                        centerId={1}
                        onSuccess={async () => {
                            await fetchClients({ page: 1, limit: 200 });
                            await refetch();
                        }}
                        onNotify={(notification) => {
                            setToast({
                                open: true,
                                type: notification.type,
                                message: notification.message,
                            });
                        }}
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

                    <Toast
                        isOpen={toast.open}
                        type={toast.type}
                        message={toast.message}
                        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
                    />
                </div>
            </PageLayout>
        </SidebarLayout>
    );
}