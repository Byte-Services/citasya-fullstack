import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckIcon, ChevronDownIcon, Loader2Icon } from "lucide-react";

export type HistoryStatus = "programada" | "en_progreso" | "completada" | "cancelada";

export type HistoryItem = {
  appointmentId: number;
  id: string;
  date: string;
  time: string;
  client: string;
  service: string;
  specialist: string;
  status: HistoryStatus;
  amount: string;
};

interface HistoryTableProps {
  data: HistoryItem[];
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  onStatusChange: (appointmentId: number, nextStatus: HistoryStatus) => void | Promise<void>;
  updatingStatusId?: number | null;
}

const STATUS_STYLE: Record<HistoryStatus, string> = {
  programada: "bg-blue-100 text-blue-700",
  en_progreso: "bg-amber-100 text-amber-700",
  completada: "bg-emerald-100 text-emerald-700",
  cancelada: "bg-rose-100 text-rose-700",
};

const STATUS_LABEL: Record<HistoryStatus, string> = {
  programada: "Programada",
  en_progreso: "En progreso",
  completada: "Completada",
  cancelada: "Cancelada",
};

const STATUS_OPTIONS: HistoryStatus[] = [
  "programada",
  "completada",
  "cancelada",
  "en_progreso",
];

export const HistoryTable: React.FC<HistoryTableProps> = ({
  data,
  searchTerm,
  setSearchTerm,
  onStatusChange,
  updatingStatusId,
}) => {
  const [statusFilter, setStatusFilter] = useState("");
  const [specialistFilter, setSpecialistFilter] = useState("");
  const [page, setPage] = useState(1);
  const [openStatusMenuId, setOpenStatusMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const perPage = 8;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (event.target instanceof Node && !menuRef.current.contains(event.target)) {
        setOpenStatusMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filtered = data.filter(item => {
    const matchesSearch =
      item.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    const matchesSpecialist = specialistFilter ? item.specialist === specialistFilter : true;
    return matchesSearch && matchesStatus && matchesSpecialist;
  });
  const total = filtered.length;
  const totalPages = Math.ceil(total / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const specialists = Array.from(new Set(data.map(d => d.specialist)));

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por cliente o ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="px-4 py-2 rounded-lg border border-gray-200 text-slate-600 bg-white focus:border-primary outline-none cursor-pointer">
            <option value="">Estado</option>
            <option value="programada">Programada</option>
            <option value="en_progreso">En progreso</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
            <option value="no_asistio">No Asistió</option>
          </select>
          <select value={specialistFilter} onChange={e => { setSpecialistFilter(e.target.value); setPage(1); }} className="px-4 py-2 rounded-lg border border-gray-200 text-slate-600 bg-white focus:border-primary outline-none cursor-pointer">
            <option value="">Especialista</option>
            {specialists.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID / Fecha</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Servicio</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Especialista</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.map((item, index) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50/50 transition-colors group"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-800">{item.id}</div>
                  <div className="text-xs text-slate-500">{item.date} • {item.time}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-800">{item.client}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-600">{item.service}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-600">{item.specialist}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className="relative inline-block"
                    ref={openStatusMenuId === item.appointmentId ? menuRef : null}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setOpenStatusMenuId((current) =>
                          current === item.appointmentId ? null : item.appointmentId,
                        );
                      }}
                      disabled={updatingStatusId === item.appointmentId}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60 disabled:cursor-not-allowed ${STATUS_STYLE[item.status]}`}
                      aria-label={`Cambiar estado de ${item.id}`}
                    >
                      {updatingStatusId === item.appointmentId ? (
                        <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ChevronDownIcon className="w-3.5 h-3.5" />
                      )}
                      <span>{STATUS_LABEL[item.status]}</span>
                    </button>

                    {openStatusMenuId === item.appointmentId && (
                      <div className="absolute left-0 top-10 z-30 min-w-[180px] rounded-xl border border-slate-200 bg-white shadow-lg p-1.5">
                        {STATUS_OPTIONS.map((statusOption) => {
                          const isActive = statusOption === item.status;
                          return (
                            <button
                              key={statusOption}
                              type="button"
                              onClick={() => {
                                setOpenStatusMenuId(null);
                                if (!isActive) {
                                  void onStatusChange(item.appointmentId, statusOption);
                                }
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${isActive ? "bg-slate-100 text-slate-800" : "text-slate-600 hover:bg-slate-50"}`}
                            >
                              <span>{STATUS_LABEL[statusOption]}</span>
                              {isActive && <CheckIcon className="w-4 h-4 text-primary" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-800">{item.amount}</div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-slate-500">
        <div>Mostrando {total === 0 ? 0 : (page - 1) * perPage + 1} a {Math.min(page * perPage, total)} de {total} registros</div>
        <div className="flex space-x-1">
          <button
            className="px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >Anterior</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 3).map(p => (
            <button
              key={p}
              className={`px-3 py-1 ${page === p ? "bg-primary text-white" : "border border-gray-200"} rounded-md hover:bg-gray-50`}
              onClick={() => setPage(p)}
            >{p}</button>
          ))}
          {totalPages > 3 && <span className="px-2 py-1">...</span>}
          {totalPages > 3 && (
            <button
              className="px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-50"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >Siguiente</button>
          )}
        </div>
      </div>
    </div>
  );
};

