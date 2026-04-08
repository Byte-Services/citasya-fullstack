import React from 'react';
import {
  MailIcon,
  PhoneIcon,
  CalendarIcon,
  Edit2Icon,
  Trash2Icon,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

export interface WorkerProfileData {
  id: number;
  name: string;
  role: string;
  documentId?: string;
  email: string;
  phone: string;
  status: string;
  rating: number;
  services: string[];
  schedule: string;
  selectedDays?: string[];
  startTime?: string;
  endTime?: string;
}

interface WorkerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: WorkerProfileData | null;
  onEdit: () => void;
  onDelete: () => void;
}

export default function WorkerProfileModal({
  isOpen,
  onClose,
  worker,
  onEdit,
  onDelete,
}: WorkerProfileModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Perfil del Trabajador">
      {worker && (
        <div className="flex flex-col h-full">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-4xl font-bold mb-4 border-4 border-white shadow-sm">
              {worker.name.charAt(0)}
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">{worker.name}</h2>
            <p className="text-primary font-medium mb-3">{worker.role}</p>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                worker.status === 'Activo'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {worker.status}
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
                  <span>{worker.email}</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <PhoneIcon className="w-5 h-5 mr-3 text-slate-400" />
                  <span>{worker.phone}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">
                Horario
              </h3>
              <div className="flex items-center text-slate-600">
                <CalendarIcon className="w-5 h-5 mr-3 text-slate-400" />
                <span>{worker.schedule}</span>
              </div>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex space-x-3">
            <button
              type="button"
              onClick={onEdit}
              className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-lg font-medium border border-primary text-primary hover:bg-primary/5 transition-colors"
            >
              <Edit2Icon className="w-4 h-4 mr-2" />
              Editar
            </button>
            <button
              type="button"
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
}
