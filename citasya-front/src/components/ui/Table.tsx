/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Dropdown from "@/components/common/Dropdown";
import { SearchIcon } from "lucide-react";
import { motion } from "framer-motion";
import { MailIcon, PhoneIcon, CalendarIcon } from "lucide-react";


type Client = {
  id: number;
  name: string;
  phone: string;
  lastVisit: string;
  visits: number;
  status: string;
  notes?: string;
  documentId: string;
  center_id: number | string;
};

interface TableProps {
  data: any;
  onRowClick: any;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

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


export const Table: React.FC<TableProps> = ({ data, onRowClick, searchTerm, setSearchTerm }) => {
  const [statusFilter, setStatusFilter] = React.useState("");
  const filtered = data.filter((client: any) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? client.status.toLowerCase() === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="bg-white p-4 rounded-2xl shadow-soft border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-gray-50/50"
          />
        </div>
          <Dropdown
            name="status"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            options={["VIP", "Frecuente", "Nuevo", "Regular"]}
            placeholder="Todos los estados"
          />
       
      </div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {filtered.map((client: any) => (
          <motion.div
            key={client.id}
            variants={itemVariants}
            onClick={() => onRowClick(client)}
            className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                  {client.name.charAt(0)}
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}
                >
                  {client.status}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors">
                {client.name}
              </h3>

              <div className="space-y-2 mt-4">
                {/* Email eliminado */}
                <div className="flex items-center text-sm text-slate-500">
                  <PhoneIcon className="w-4 h-4 mr-2 text-slate-400" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center text-sm text-slate-500">
                  <span className="font-semibold mr-2">DNI:</span>
                  <span>{client.documentId}</span>
                </div>
                <div className="flex items-center text-sm text-slate-500">
                  <span className="font-semibold mr-2">Centro:</span>
                  <span>{client.center_id === 1 ? "Madrid" : client.center_id === 2 ? "Barcelona" : client.center_id}</span>
                </div>
                {client.notes && (
                  <div className="flex items-center text-xs text-slate-400 italic mt-1">
                    <span>{client.notes}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50/80 px-6 py-3 border-t border-gray-100 flex justify-between items-center text-sm">
              <div className="flex items-center text-slate-600">
                <CalendarIcon className="w-4 h-4 mr-1.5 text-slate-400" />
                <span>{client.lastVisit}</span>
              </div>
              <div className="font-medium text-slate-800">
                {client.visits} citas
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </>
  );
};
