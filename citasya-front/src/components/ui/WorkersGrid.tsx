import React from 'react';
import { motion, Variants } from 'framer-motion';
import {
  MailIcon,
  PhoneIcon,
  StarIcon,
  CalendarIcon,
  Edit2Icon,
  Trash2Icon,
} from 'lucide-react';

export interface WorkerGridItem {
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
}

interface WorkersGridProps {
  workers: WorkerGridItem[];
  containerVariants: Variants;
  itemVariants: Variants;
  onEdit: (worker: WorkerGridItem) => void;
  onDelete: (worker: WorkerGridItem) => void;
  onViewProfile: (worker: WorkerGridItem) => void;
}

export default function WorkersGrid({
  workers,
  containerVariants,
  itemVariants,
  onEdit,
  onDelete,
  onViewProfile,
}: WorkersGridProps) {
  return (
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
                  <h3 className="text-lg font-bold text-slate-800">{worker.name}</h3>
                  <p className="text-sm text-primary font-medium">{worker.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(worker);
                    }}
                    className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                  >
                    <Edit2Icon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(worker);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </button>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    worker.status === 'Activo'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
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
              <span className="text-sm font-bold text-slate-800">{worker.rating}</span>
              <span className="text-xs text-slate-500 ml-1">/ 5.0</span>
            </div>
            <button
              type="button"
              onClick={() => onViewProfile(worker)}
              className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
            >
              Ver perfil
            </button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
