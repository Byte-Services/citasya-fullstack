'use client';

import * as React from "react";
import { useState, useEffect } from "react";
import { VscEdit } from "react-icons/vsc";
import { EditarCliente } from "./EditClient";
import { EliminarCliente } from "./DeleteClient";
import { useUser } from "../../context/UserContext";
import { VscChevronLeft, VscChevronRight } from "react-icons/vsc"; 
import {  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from "recharts";

interface FullClientData {
  id: number;
  name: string;
  documentId: string;
  phone: string;
  notes: string;
  appointments: {
    date: string;
    status: string;
    service: {
      name: string;
      price: string;
    };
  }[];
}

interface MonthlyData {
  month: string;
  citas: number;
  total: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    payload: MonthlyData;
  }[];
  label?: string;
}



interface ClientProfileProps {
  clientId: number;
  onCloseProfile: () => void;
}

export default function ClientProfile({ clientId, onCloseProfile }: ClientProfileProps) {
  const { user } = useUser();
  const [fullClientData, setFullClientData] = useState<FullClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 5;

  const fetchClientProfile = React.useCallback(async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/clients/${clientId}`);
      if (!response.ok) {
        throw new Error(`Error en la respuesta de la red: ${response.statusText}`);
      }
      const data = await response.json();
      setFullClientData(data);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError("Error al cargar el perfil del cliente: " + e.message);
        console.error("Error fetching client profile:", e);
      } else {
        setError("Error desconocido al cargar el perfil del cliente.");
        console.error("Unknown error fetching client profile:", e);
      }
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchClientProfile();
  }, [clientId, fetchClientProfile]);

  // --- Transformar citas concluidas a dataset mensual ---
  const monthlyData: MonthlyData[] = React.useMemo(() => {
    const grouped: { [key: string]: { citas: number; total: number } } = {};

    if (fullClientData && fullClientData.appointments) {
      fullClientData.appointments
        .filter(appt => appt.status === "Concluida")
        .forEach(appt => {
          const date = new Date(appt.date);
          const key = `${date.getFullYear()}-${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}`;

          if (!grouped[key]) {
            grouped[key] = { citas: 0, total: 0 };
          }

          grouped[key].citas += 1;
          grouped[key].total += parseFloat(appt.service?.price ?? "0");
        });
    }

    let data = Object.entries(grouped).map(([month, values]) => ({
      month,
      citas: values.citas,
      total: values.total,
    }));

    data.sort((a, b) => new Date(a.month + "-01").getTime() - new Date(b.month + "-01").getTime());

    data = data.slice(0, 6);

    return data.reverse();
  }, [fullClientData]);



// --- Custom tooltip para mostrar dinero invertido ---
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="bg-white p-3 shadow-md rounded-lg text-xs text-neutral-700">
        <p className="font-medium">Mes: {label}</p>
        <p>Citas concluidas: {data.citas}</p>
        <p>
          Inversión:{" "}
          {data.total.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
        </p>
      </div>
    );
  }
  return null;
};




  const handleDeleteClient = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/clients/${clientId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return Promise.reject(new Error(errorData.message || "No se pudo eliminar el cliente."));
    }

    setShowDeleteModal(false);
    onCloseProfile();
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!fullClientData) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Perfil no encontrado.</p>
      </div>
    );
  }

  

  const clientData = {
    nombre: fullClientData.name,
    cedula: fullClientData.documentId,
    telefono: fullClientData.phone,
    notes: fullClientData.notes,
  };

  const totalInvertido = fullClientData.appointments
    .filter(appt => appt.status === "Concluida")
    .reduce((sum, appt) => sum + parseFloat(appt.service?.price ?? 0), 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getUTCDate().toString().padStart(2, "0");
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatPhone = (phone: string) => {
    if (!phone || phone.length !== 12 || !phone.startsWith("58")) return phone;
    const area = phone.slice(2, 5);
    const number = phone.slice(5);
    return `0${area}-${number}`;
  };
  
  const allAppointments = fullClientData.appointments
    .filter(appt => appt.status === "Concluida")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const totalPages = Math.ceil(allAppointments.length / appointmentsPerPage);
  const startIndex = (currentPage - 1) * appointmentsPerPage;
  const paginatedAppointments = allAppointments.slice(startIndex, startIndex + appointmentsPerPage);

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="flex bg-gray-100 " style={{ fontFamily: 'Poppins, sans-serif'}}>
      <aside className="flex flex-col w-full max-w-2xl rounded-lg bg-white shadow-md pb-8">
        <div className="bg-[#D6EBF3] px-8 pt-6 pb-6 rounded-t-lg">
          <h2 className="text-base font-medium tracking-wide leading-none text-left text-[#447F98]">
              Perfil del Cliente
          </h2>
        </div>        
        <div className="flex px-8 gap-4 justify-between items-center mt-6 text-sm font-medium text-neutral-600">
          <h3 className="flex items-center gap-2">
            <span>Datos del cliente</span>
          </h3>
          <VscEdit onClick={() => setShowEditModal(true)} size={18} className="text-[#447F98] cursor-pointer hover:text-[#629BB5] transition-colors" />
        </div>

        <div className="mt-4 px-8">
          <div className="text-xs text-neutral-600">Nombre del cliente:</div>
          <div className="flex flex-col px-5 py-3 mt-2 text-xs bg-white rounded-lg shadow-sm text-neutral-600">
            <div>{clientData.nombre}</div>
          </div>
        </div>

        <div className="mt-4 px-8">
          <div className="text-xs text-neutral-600">Cédula:</div>
          <div className="flex flex-col px-5 py-3 mt-2 text-xs bg-white rounded-lg shadow-sm text-neutral-600">
            <div>{clientData.cedula}</div>
          </div>
        </div>

        <div className="mt-4 px-8">
          <div className="text-xs text-neutral-600">Teléfono:</div>
          <div className="flex flex-col px-5 py-3 mt-2 text-xs bg-white rounded-lg shadow-sm text-neutral-600">
            <div>{formatPhone(clientData.telefono)}</div>
          </div>
        </div>

        <div className="mt-4 px-8">
          <div className="text-xs text-neutral-600">Notas:</div>
          <div className="flex flex-col px-5 py-3 mt-2 text-xs bg-white rounded-lg shadow-sm text-neutral-600">
            <div>{clientData.notes}</div>
          </div>
        </div>

        {/* Gráfico de Citas Concluidas por Mes */}
        <div className="w-full h-64 px-8 mt-6">
          <h3 className="flex items-center gap-2 text-sm font-medium text-neutral-600">
            <span>Citas concluidas por mes</span>
          </h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(monthStr: string) => {
                    const [year, month] = monthStr.split("-");
                    return `${month}/${year}`;
                  }}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="citas" fill="#629BB5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-full text-sm text-gray-500">
              Este cliente no ha tenido citas aún.
            </div>
          )}
        </div>

        <h3 className="self-start px-8 mt-6 text-sm font-medium text-neutral-600">
          Historial de Citas
        </h3>

        <div className="px-8 mt-4 w-full">
          <table className="min-w-full shadow-sm rounded-lg table-fixed">
            <thead className="bg-neutral-100 border-b border-gray-200">
              <tr>
                <th
                  scope="col"
                  className="w-2/3 px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider"
                >
                  Servicio
                </th>
                <th
                  scope="col"
                  className="w-1/3 px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider"
                >
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="bg-white max-h-60">
              {paginatedAppointments.length > 0 ? (
                paginatedAppointments.map((entry, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td
                      className="px-6 py-4 text-xs text-neutral-600 break-words text-center"
                    >
                      {entry.service?.name || "Servicio desconocido"}
                    </td>
                    <td className="px-6 py-4 text-xs text-neutral-600 text-center">
                      {formatDate(entry.date)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-center text-xs text-gray-500">
                    No hay citas en el historial.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Controles de paginación con flechas */}
          {allAppointments.length > appointmentsPerPage && (
            <div className="flex justify-center items-center mt-4 space-x-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`flex items-center justify-center w-8 h-8 rounded-full shadow-md text-xs
                  ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#D6EBF3] text-[#447F98] hover:bg-[#B0E0E6]'}`
                }
              >
                <VscChevronLeft />
              </button>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center w-8 h-8 rounded-full shadow-md text-xs
                  ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#D6EBF3] text-[#447F98] hover:bg-[#B0E0E6]'}`
                }
              >
                <VscChevronRight />
              </button>
            </div>
          )}
        </div>

        {user?.role === 'Admin' ? (
        <>
        <h3 className="self-start px-8 mt-6 text-sm font-medium text-neutral-600">
            Total Invertido
        </h3>
        <div className="self-center text-xl font-bold text-center leading-[66px] text-[#629BB5]">
            {totalInvertido.toLocaleString("en-US", { style: "currency", currency: "USD" })}
        </div>
        </>
        ) : null }

        <button onClick={() => setShowDeleteModal(true)} className="flex justify-center items-center self-center px-10 py-3 mt-6 text-sm font-medium text-center rounded-lg bg-[#FEE2E2] text-[#B91C1C] shadow-md w-full max-w-[141px] hover:bg-[#FFC1C1] transition-colors">
          <span>Eliminar Cliente</span>
        </button>
      </aside>

      {showEditModal && (
        <EditarCliente
          onClose={() => setShowEditModal(false)}
          clientData={{
            id: fullClientData.id,
            nombre: fullClientData.name,
            cedula: fullClientData.documentId,
            telefono: fullClientData.phone,
            notes: fullClientData.notes,
          }}
          onClientUpdated={fetchClientProfile}
        />
      )}

      {showDeleteModal && (
        <EliminarCliente
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteClient}
        />
      )}
    </div>
  );
}