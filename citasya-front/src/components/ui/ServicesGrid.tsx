import React from 'react';
import { motion, Variants } from 'framer-motion';
import { ClockIcon, Edit2Icon, Trash2Icon } from 'lucide-react';

interface ServiceItem {
  id: number;
  name: string;
  category: string;
  duration: string;
  price: number;
  description: string;
}

interface ServicesGridProps {
  services: ServiceItem[];
  activeTab: string;
  containerVariants: Variants;
  itemVariants: Variants;
  onEdit: (service: ServiceItem) => void;
  onDelete: (id: number) => void;
}

export default function ServicesGrid({
  services,
  activeTab,
  containerVariants,
  itemVariants,
  onEdit,
  onDelete,
}: ServicesGridProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      key={activeTab}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {services.map((service) => (
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
                  type="button"
                  onClick={() => onEdit(service)}
                  className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                >
                  <Edit2Icon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(service.id)}
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
  );
}
