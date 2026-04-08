"use client"
import React, { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import PageLayout from "@/components/layout/PageLayout";
import SidebarLayout from "@/components/layout/SidebarLayout";
import WorkersGrid from "@/components/ui/WorkersGrid";
import WorkerProfileModal, {
    WorkerProfileData,
} from "@/components/ui/WorkerProfileModal";
import WorkerForm, {
    WorkerFormValues,
} from "@/components/form/WorkerForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import Toast from "@/components/ui/Toast";
import { useWorkerStore } from "@/store/workerStore";
import { Worker } from "@/interfaces/workers";

export default function WorkersPage() {
    const { workers: workersData, fetchWorkers, deleteWorker } = useWorkerStore();

    // Modals state
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    // Selection state
    const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);
    const [editingWorkerId, setEditingWorkerId] = useState<number | null>(null);
    const [toast, setToast] = useState<{
        open: boolean;
        type: "success" | "error";
        message: string;
    }>({
        open: false,
        type: "success",
        message: "",
    });
    const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    const initialWorkerFormValues: WorkerFormValues = {
        name: '',
        documentId: '',
        email: '',
        phone: '',
        status: 'Activo',
        selectedDays: [],
        startTime: '09:00',
        endTime: '18:00',
    };
    const [workerFormValues, setWorkerFormValues] = useState<WorkerFormValues>(initialWorkerFormValues);

    const { refetch } = useQuery({
        queryKey: ["workers-page-workers"],
        queryFn: async () => {
            await fetchWorkers({ page: 1, limit: 200 });
            return true;
        },
    });

    const workers = useMemo<WorkerProfileData[]>(() => {
        const typedWorkers = workersData as Worker[];
        return typedWorkers.map((worker) => {
            const scheduleObj = (worker.schedule || {}) as {
                days?: string[];
                startTime?: string;
                endTime?: string;
            };

            const selectedDays = Array.isArray(scheduleObj.days)
                ? scheduleObj.days
                : [];
            const startTime = scheduleObj.startTime || '09:00';
            const endTime = scheduleObj.endTime || '18:00';
            const scheduleText = selectedDays.length > 0
                ? `${selectedDays.join(', ')}, ${startTime} - ${endTime}`
                : 'Sin horario';

            return {
                id: worker.id,
                name: worker.name,
                role: 'Trabajador',
                documentId: worker.documentId || '',
                email: worker.email || 'Sin correo',
                phone: worker.phone || 'Sin telefono',
                status: worker.status || 'Activo',
                rating: 5,
                services: [],
                schedule: scheduleText,
                selectedDays,
                startTime,
                endTime,
            };
        });
    }, [workersData]);

    const selectedWorker = useMemo(() => {
        if (!selectedWorkerId) return null;
        return workers.find((worker) => worker.id === selectedWorkerId) || null;
    }, [selectedWorkerId, workers]);

    const deleteWorkerMutation = useMutation({
        mutationFn: async (id: number) => {
            await deleteWorker(id);
        },
        onSuccess: async () => {
            await refetch();
        },
    });
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
    const openNewWorkerModal = () => {
        setEditingWorkerId(null);
        setWorkerFormValues(initialWorkerFormValues);
        setIsFormModalOpen(true);
    };
    const openEditWorkerModal = (worker?: WorkerProfileData) => {
        const target = worker || selectedWorker;
        if (!target) return;
        setEditingWorkerId(target.id);
        setWorkerFormValues({
            name: target.name,
            documentId: target.documentId || '',
            email: target.email,
            phone: target.phone,
            status: target.status,
            selectedDays: target.selectedDays || [],
            startTime: target.startTime || '09:00',
            endTime: target.endTime || '18:00',
        });
        setIsProfileOpen(false);
        setIsFormModalOpen(true);
    };
    const openProfile = (worker: WorkerProfileData) => {
        setSelectedWorkerId(worker.id);
        setIsProfileOpen(true);
    };
    const openDeleteDialog = (worker?: WorkerProfileData) => {
        if (worker) setSelectedWorkerId(worker.id);
        setIsDeleteDialogOpen(true);
    };
    const handleDeleteConfirm = () => {
        if (selectedWorker) {
            deleteWorkerMutation.mutate(selectedWorker.id);
            setIsDeleteDialogOpen(false);
            setIsProfileOpen(false);
            setSelectedWorkerId(null);
        }
    };
    const handleWorkerFormSuccess = async () => {
        await refetch();
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
                    

                    <WorkersGrid
                        workers={workers}
                        containerVariants={containerVariants}
                        itemVariants={itemVariants}
                        onEdit={openEditWorkerModal}
                        onDelete={(worker) => openDeleteDialog(worker)}
                        onViewProfile={openProfile}
                    />

                    {/* Form Modal (Add/Edit) */}
                    <WorkerForm
                        isOpen={isFormModalOpen}
                        onClose={() => setIsFormModalOpen(false)}
                        editingWorkerId={editingWorkerId}
                        initialValues={workerFormValues}
                        daysOfWeek={daysOfWeek}
                        onSuccess={handleWorkerFormSuccess}
                        onNotify={(notification) => {
                            setToast({
                                open: true,
                                type: notification.type,
                                message: notification.message,
                            });
                        }}
                    />

                    {/* Profile View Modal */}
                    <WorkerProfileModal
                        isOpen={isProfileOpen}
                        onClose={() => setIsProfileOpen(false)}
                        worker={selectedWorker}
                        onEdit={() => openEditWorkerModal()}
                        onDelete={() => openDeleteDialog()}
                    />

                    {/* Delete Confirmation */}
                    <ConfirmDialog
                        isOpen={isDeleteDialogOpen}
                        onClose={() => setIsDeleteDialogOpen(false)}
                        onConfirm={handleDeleteConfirm}
                        title="¿Eliminar trabajador?"
                        message="Esta acción no se puede deshacer. Se eliminará permanentemente del equipo."
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