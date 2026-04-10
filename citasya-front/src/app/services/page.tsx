"use client"
import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import PageLayout from "@/components/layout/PageLayout";
import SidebarLayout from "@/components/layout/SidebarLayout";
import Tabs from "@/components/common/Tabs";
import ServicesGrid from "@/components/ui/ServicesGrid";
import ServicesForm, { ServiceFormValues } from "@/components/form/ServicesForm";
import SpecialtiesForm from "@/components/form/SpecialtiesForm";
import { useServiceStore } from "@/store/serviceStore";
import { useSpecialtyStore } from "@/store/specialtyStore";
import { Service } from "@/interfaces/service";
import { Specialty } from "@/interfaces/specialty";

type LocalService = {
    id: number;
    name: string;
    category: string;
    duration: string;
    price: number;
    description: string;
};

const initialServiceFormValues: ServiceFormValues = {
    name: '',
    category: '',
    duration: '60 min',
    price: '',
    description: '',
};

export default function ServicesPage() {
    const { services: storeServices, fetchServices, deleteService } = useServiceStore();
    const { specialties, fetchSpecialties } = useSpecialtyStore();

    const [activeTab, setActiveTab] = useState('Todos');
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
    const [serviceFormValues, setServiceFormValues] = useState<ServiceFormValues>(initialServiceFormValues);

    const typedSpecialties = specialties as Specialty[];
    const typedServices = storeServices as Service[];

    const specialtyOptions = useMemo(() => {
        const registry = new Map<string, Specialty>();

        typedSpecialties.forEach((specialty) => {
            const normalizedName = specialty.name.trim().toLowerCase();
            if (!registry.has(normalizedName)) {
                registry.set(normalizedName, specialty);
            }
        });

        return Array.from(registry.values());
    }, [typedSpecialties]);

    const categories = useMemo(
        () => specialtyOptions.map((specialty) => specialty.name),
        [specialtyOptions],
    );

    const { refetch: refetchServices } = useQuery({
        queryKey: ['services-page-services'],
        queryFn: async () => {
            await fetchServices({ page: 1, limit: 100 });
            return true;
        },
    });

    useQuery({
        queryKey: ['services-page-specialties'],
        queryFn: async () => {
            await fetchSpecialties({ page: 1, limit: 100 });
            return true;
        },
    });

    const services = useMemo<LocalService[]>(() => {
        return typedServices.map((service) => {
            const specialty = typedSpecialties.find(
                (item) => item.id === service.specialty_id,
            );

            return {
                id: service.id,
                name: service.name,
                category: specialty?.name || 'Sin categoría',
                duration: `${service.minutes_duration || 60} min`,
                price: service.price,
                description: service.description,
            };
        });
    }, [typedServices, typedSpecialties]);

    const tabs = ['Todos', ...categories];

    const deleteServiceMutation = useMutation({
        mutationFn: async (id: number) => {
            await deleteService(id);
        },
        onSuccess: async () => {
            await refetchServices();
        },
    });

    const filteredServices =
        activeTab === 'Todos'
            ? services
            : services.filter((s) => s.category === activeTab);
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
            scale: 0.95,
        },
        show: {
            opacity: 1,
            scale: 1,
        },
    };
    const openNewServiceModal = () => {
        setEditingServiceId(null);
        setServiceFormValues({
            name: '',
            category: categories[0] || '',
            duration: '60 min',
            price: '',
            description: '',
        });
        setIsServiceModalOpen(true);
    };
    const openEditServiceModal = (service: LocalService) => {
        setEditingServiceId(service.id);
        setServiceFormValues({
            name: service.name,
            category: service.category,
            duration: service.duration,
            price: service.price.toString(),
            description: service.description,
        });
        setIsServiceModalOpen(true);
    };
    const handleDeleteService = (id: number) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
            deleteServiceMutation.mutate(id);
        }
    };

    const handleServiceFormSuccess = async (values: ServiceFormValues) => {
        void values;
        await refetchServices();
    };
    const usedCategories = Array.from(new Set(services.map((service) => service.category)));

    useEffect(() => {
        if (activeTab !== 'Todos' && !categories.includes(activeTab)) {
            setActiveTab('Todos');
        }
    }, [activeTab, categories]);

    return (
        <SidebarLayout>
            <PageLayout
                title="Servicios"
                subtitle="Administra el catálogo de servicios que ofreces"
                createButtonText="Nuevo Servicio"
                showCreateButton={true}
                onCreateClick={openNewServiceModal}
                actions={
                    <button
                        type="button"
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-slate-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                        Gestionar especialidades
                    </button>
                }
            >
                <div className="w-full max-w-screen-2xl mx-auto">
                    

                    {/* Tabs */}
                    <Tabs options={tabs} onChange={setActiveTab} />

                    {/* Services Grid */}
                    <ServicesGrid
                        services={filteredServices}
                        activeTab={activeTab}
                        containerVariants={containerVariants}
                        itemVariants={itemVariants}
                        onEdit={openEditServiceModal}
                        onDelete={handleDeleteService}
                    />

                    {/* Service Modal */}
                    <ServicesForm
                        isOpen={isServiceModalOpen}
                        onClose={() => setIsServiceModalOpen(false)}
                        specialties={specialtyOptions}
                        categories={categories}
                        initialValues={serviceFormValues}
                        editingServiceId={editingServiceId}
                        onSuccess={handleServiceFormSuccess}
                    />

                    {/* Categories/Specialties Modal */}
                    <SpecialtiesForm
                        isOpen={isCategoryModalOpen}
                        onClose={() => setIsCategoryModalOpen(false)}
                        usedCategories={usedCategories}
                    />
                </div>
            </PageLayout>
        </SidebarLayout>
    );
}