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
import { useUserStore } from "@/store/userStore";
import { User } from "@/interfaces/userEntity";

export default function WorkersPage() {
    const { users, fetchUsers, deleteUser } = useUserStore();

    // Modals state
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    // Selection state
    const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);
    const [editingWorkerId, setEditingWorkerId] = useState<number | null>(null);
    const availableSpecialties = ['Faciales', 'Corporales', 'Masajes', 'Uñas'];
    const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    const initialWorkerFormValues: WorkerFormValues = {
        name: '',
        role: '',
        email: '',
        phone: '',
        status: 'Activo',
        specialties: [],
        selectedDays: [],
        startTime: '09:00',
        endTime: '18:00',
    };
    const [workerFormValues, setWorkerFormValues] = useState<WorkerFormValues>(initialWorkerFormValues);

    const { refetch } = useQuery({
        queryKey: ["workers-page-users"],
        queryFn: async () => {
            await fetchUsers({ page: 1, limit: 200 });
            return true;
        },
    });

    const workers = useMemo<WorkerProfileData[]>(() => {
        const typedUsers = users as User[];
        return typedUsers.map((user) => ({
            id: user.id,
            name: user.name,
            role: user.role || 'Especialista',
            email: user.email,
            phone: 'Sin telefono',
            status: user.status || 'Activo',
            rating: 5,
            services: [],
            schedule: 'Sin horario',
            selectedDays: [],
            startTime: '09:00',
            endTime: '18:00',
        }));
    }, [users]);

    const selectedWorker = useMemo(() => {
        if (!selectedWorkerId) return null;
        return workers.find((worker) => worker.id === selectedWorkerId) || null;
    }, [selectedWorkerId, workers]);

    const deleteWorkerMutation = useMutation({
        mutationFn: async (id: number) => {
            await deleteUser(id);
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
            role: target.role,
            email: target.email,
            phone: target.phone,
            status: target.status,
            specialties: target.services,
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
    const handleWorkerFormSuccess = () => {
        void refetch();
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
                        availableSpecialties={availableSpecialties}
                        daysOfWeek={daysOfWeek}
                        onSuccess={handleWorkerFormSuccess}
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
                </div>
            </PageLayout>
        </SidebarLayout>
    );
}