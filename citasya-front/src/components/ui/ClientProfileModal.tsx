import React from "react";
import { Modal } from "@/components/ui/Modal";
import { PhoneIcon, Edit2Icon, Trash2Icon } from "lucide-react";
import { Client } from "@/interfaces/client";


interface ClientProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client | null;
    onEdit: () => void;
    onDelete: () => void;
    getStatusColor: (status: string) => string;
}

export const ClientProfileModal: React.FC<ClientProfileModalProps> = ({
    isOpen,
    onClose,
    client,
    onEdit,
    onDelete,
    getStatusColor,
}) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Perfil del Cliente">
        {client && (
            <div className="flex flex-col h-full">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-4xl font-bold mb-4 border-4 border-white shadow-sm">
                        {client.name.charAt(0)}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">
                        {client.name}
                    </h2>
                    <span
                        className={`px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700`}
                    >
                        Activo
                    </span>
                </div>

                <div className="space-y-6 flex-1">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">
                            Contacto
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center text-slate-600">
                                <PhoneIcon className="w-5 h-5 mr-3 text-slate-400" />
                                <span>{client.phone}</span>
                            </div>
                        </div>
                    </div>

                    {/* <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">
                            Actividad
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Última Visita</p>
                                <p className="font-medium text-slate-800 flex items-center">
                                    <CalendarIcon className="w-4 h-4 mr-1.5 text-slate-400" />
                                    {client.lastVisit}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Total Citas</p>
                                <p className="font-medium text-slate-800">
                                    {client.visits} citas
                                </p>
                            </div>
                        </div>
                    </div> */}

                    {client.notes && (
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                            <h3 className="text-sm font-bold text-amber-800 mb-2 uppercase tracking-wider">
                                Notas
                            </h3>
                            <p className="text-amber-700 text-sm leading-relaxed">
                                {client.notes}
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex space-x-3">
                    <button
                        onClick={onEdit}
                        className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-lg font-medium border border-primary text-primary hover:bg-primary/5 transition-colors"
                    >
                        <Edit2Icon className="w-4 h-4 mr-2" />
                        Editar
                    </button>
                    <button
                        onClick={onDelete}
                        className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-lg font-medium border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                        <Trash2Icon className="w-4 h-4 mr-2" />
                        Eliminar
                    </button>
                </div>
            </div>
        )}
    </Modal>
);
