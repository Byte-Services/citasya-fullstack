"use client"
import React, { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import SidebarLayout from "@/components/layout/SidebarLayout";

import { motion } from "framer-motion";
import {
    PlusIcon,
    ClockIcon,
    Edit2Icon,
    Trash2Icon,
    SettingsIcon,
    XIcon,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";

export default function ServicesPage() {
    const [activeTab, setActiveTab] = useState('Todos');
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
    const [categories, setCategories] = useState([
        'Faciales',
        'Corporales',
        'Masajes',
        'Uñas',
    ]);
    const [newCategory, setNewCategory] = useState('');
    const tabs = ['Todos', ...categories];
    const [services, setServices] = useState([
        {
            id: 1,
            name: 'Limpieza Facial Profunda',
            category: 'Faciales',
            duration: '60 min',
            price: 60,
            description: 'Limpieza, exfoliación, extracción y mascarilla hidratante.',
        },
        {
            id: 2,
            name: 'Masaje Relajante',
            category: 'Masajes',
            duration: '60 min',
            price: 45,
            description: 'Masaje de cuerpo completo para aliviar tensión y estrés.',
        },
        {
            id: 3,
            name: 'Exfoliación Corporal',
            category: 'Corporales',
            duration: '45 min',
            price: 55,
            description: 'Eliminación de células muertas e hidratación profunda.',
        },
        {
            id: 4,
            name: 'Manicure Spa',
            category: 'Uñas',
            duration: '45 min',
            price: 25,
            description: 'Limado, cutículas, exfoliación, masaje y esmaltado.',
        },
        {
            id: 5,
            name: 'Pedicure Spa',
            category: 'Uñas',
            duration: '60 min',
            price: 30,
            description: 'Tratamiento completo para pies con exfoliación y masaje.',
        },
        {
            id: 6,
            name: 'Masaje Descontracturante',
            category: 'Masajes',
            duration: '60 min',
            price: 50,
            description: 'Masaje profundo enfocado en aliviar nudos musculares.',
        },
        {
            id: 7,
            name: 'Facial Anti-edad',
            category: 'Faciales',
            duration: '90 min',
            price: 85,
            description: 'Tratamiento con radiofrecuencia y ampolletas de colágeno.',
        },
        {
            id: 8,
            name: 'Masaje con Piedras Calientes',
            category: 'Masajes',
            duration: '90 min',
            price: 70,
            description: 'Terapia relajante utilizando piedras volcánicas calientes.',
        },
    ]);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        duration: '60 min',
        price: '',
        description: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
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
    const openNewServiceModal = () => {
        setEditingServiceId(null);
        setFormData({
            name: '',
            category: categories[0] || '',
            duration: '60 min',
            price: '',
            description: '',
        });
        setErrors({});
        setIsServiceModalOpen(true);
    };
    const openEditServiceModal = (service: (typeof services)[0]) => {
        setEditingServiceId(service.id);
        setFormData({
            name: service.name,
            category: service.category,
            duration: service.duration,
            price: service.price.toString(),
            description: service.description,
        });
        setErrors({});
        setIsServiceModalOpen(true);
    };
    const handleDeleteService = (id: number) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
            setServices(services.filter((s) => s.id !== id));
        }
    };
    const handleServiceSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Requerido';
        if (!formData.category) newErrors.category = 'Requerido';
        if (!formData.price || isNaN(Number(formData.price)))
            newErrors.price = 'Precio inválido';
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        const serviceData = {
            name: formData.name,
            category: formData.category,
            duration: formData.duration,
            price: Number(formData.price),
            description: formData.description,
        };
        if (editingServiceId) {
            setServices(
                services.map((s) =>
                    s.id === editingServiceId
                        ? {
                                ...s,
                                ...serviceData,
                            }
                        : s,
                ),
            );
        } else {
            setServices([
                ...services,
                {
                    id: Math.max(0, ...services.map((s) => s.id)) + 1,
                    ...serviceData,
                },
            ]);
        }
        setIsServiceModalOpen(false);
    };
    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategory.trim() && !categories.includes(newCategory.trim())) {
            setCategories([...categories, newCategory.trim()]);
            setNewCategory('');
        }
    };
    const handleRemoveCategory = (cat: string) => {
        if (services.some((s) => s.category === cat)) {
            alert('No puedes eliminar una categoría que tiene servicios asignados.');
            return;
        }
        setCategories(categories.filter((c) => c !== cat));
        if (activeTab === cat) setActiveTab('Todos');
    };

    return (
        <SidebarLayout>
            <PageLayout title="Servicios" subtitle="Administra el catálogo de servicios que ofreces" createButtonText="Nuevo Servicio" showCreateButton={true} onCreateClick={openNewServiceModal}>
                <div className="max-w-7xl mx-auto">
                    

                    {/* Tabs */}
                    <div className="flex overflow-x-auto hide-scrollbar mb-8 border-b border-gray-200">
                        <div className="flex space-x-8">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-4 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === tab ? 'text-primary' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="serviceTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Services Grid */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        key={activeTab}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {filteredServices.map((service) => (
                            <motion.div
                                key={service.id}
                                variants={itemVariants}
                                className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden group"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                            {service.category}
                                        </span>
                                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEditServiceModal(service)}
                                                className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                            >
                                                <Edit2Icon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteService(service.id)}
                                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                                            >
                                                <Trash2Icon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">
                                        {service.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-6 line-clamp-2">
                                        {service.description}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex items-center text-slate-600 font-medium">
                                            <ClockIcon className="w-4 h-4 mr-1.5 text-slate-400" />
                                            {service.duration}
                                        </div>
                                        <div className="flex items-center text-lg font-bold text-primary">
                                            ${service.price}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Service Modal */}
                    <Modal
                        isOpen={isServiceModalOpen}
                        onClose={() => setIsServiceModalOpen(false)}
                        title={editingServiceId ? 'Editar Servicio' : 'Nuevo Servicio'}
                        onSubmit={handleServiceSubmit}
                        submitLabel="Guardar"
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Nombre del Servicio <span className="text-rose-500">*</span>
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
                                    Categoría / Especialidad <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 rounded-xl border ${errors.category ? 'border-rose-500' : 'border-gray-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white`}
                                >
                                    <option value="">Selecciona una categoría</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Duración
                                    </label>
                                    <select
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                                    >
                                        <option value="30 min">30 min</option>
                                        <option value="45 min">45 min</option>
                                        <option value="60 min">60 min</option>
                                        <option value="90 min">90 min</option>
                                        <option value="120 min">120 min</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Precio ($) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.price ? 'border-rose-500' : 'border-gray-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white resize-none"
                                />
                            </div>
                        </div>
                    </Modal>

                    {/* Categories/Specialties Modal */}
                    <Modal
                        isOpen={isCategoryModalOpen}
                        onClose={() => setIsCategoryModalOpen(false)}
                        title="Gestionar Especialidades"
                    >
                        <div className="space-y-6">
                            <form onSubmit={handleAddCategory} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    placeholder="Nueva especialidad..."
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!newCategory.trim()}
                                    className="bg-primary text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                                >
                                    Agregar
                                </button>
                            </form>

                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-slate-700 mb-3">
                                    Especialidades Actuales
                                </h3>
                                {categories.map((cat) => (
                                    <div
                                        key={cat}
                                        className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-100"
                                    >
                                        <span className="font-medium text-slate-700">{cat}</span>
                                        <button
                                            onClick={() => handleRemoveCategory(cat)}
                                            className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                                            title="Eliminar especialidad"
                                        >
                                            <XIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Modal>
                </div>
            </PageLayout>
        </SidebarLayout>
    );
}