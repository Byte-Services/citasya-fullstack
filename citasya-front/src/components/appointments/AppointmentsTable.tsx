'use client';

import React, { useState } from 'react';
import { VscEdit, VscTrash } from 'react-icons/vsc';
import ReactDOM from 'react-dom';
import { SelectOption, ServiceFormField } from '../InputField';

interface AppointmentData {
  id: string;
  status: string;
  service: string;
  date: string;
  clientName: string;
  time: string;
  professional: string | null;
}

enum AppointmentStatus {
  Pendiente = "Pendiente",
  Confirmado = "Confirmado",
  Cancelado = "Cancelado",
  Concluida = "Concluida"
}

interface AppointmentsTableProps {
  appointments: AppointmentData[];
  onUpdateStatus: (id: string, newStatus: AppointmentStatus) => void;
}

export const AppointmentsTable: React.FC<AppointmentsTableProps> = ({ appointments, onUpdateStatus }) => {
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<AppointmentStatus | ''>('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(appointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAppointments = appointments.slice(startIndex, startIndex + itemsPerPage);

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const openStatusModal = (appointment: AppointmentData) => {
    setSelectedAppointment(appointment);
    setNewStatus(appointment.status as AppointmentStatus);
    setShowStatusModal(true);
  };

  const openCancelModal = (appointment: AppointmentData) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const handleUpdateStatus = () => {
    if (selectedAppointment && newStatus) {
      onUpdateStatus(selectedAppointment.id, newStatus);
      setShowStatusModal(false);
    }
  };

  const handleCancelAppointment = () => {
    if (selectedAppointment) {
      onUpdateStatus(selectedAppointment.id, AppointmentStatus.Cancelado);
      setShowCancelModal(false);
    }
  };

  const statusOptionsForModal: SelectOption<string>[] = Object.values(AppointmentStatus)
    .filter(status => status !== AppointmentStatus.Cancelado)
    .map(status => ({
      value: status,
      label: status
    }));

  const handleStatusChange = (e: { target: { name?: string; value: string | string[] } }) => {
    setNewStatus(e.target.value as AppointmentStatus);
  };

  const formatTime = (time: string) => {
    if (time && time.length > 5) {
      return time.substring(0, 5);
    }
    return time;
  };

  return (
    <div className="bg-white overflow-hidden" style={{ fontFamily: 'Poppins, sans-serif'}}>
      <div className="overflow-x-auto w-full">
      <table className="w-full divide-y divide-gray-200 sm:min-w-full min-w-[700px]">
        <thead className="bg-neutral-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 ">Estado cita</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500">Servicio</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500">Fecha</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500">Cliente</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500">Hora</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500">Especialista</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500">Gestionar cita</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginatedAppointments.map((appointment) => (
            <tr key={appointment.id}>
              <td className="px-6 py-4 whitespace-nowrap text-xs">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium
                    ${
                      appointment.status === AppointmentStatus.Pendiente
                        ? 'bg-orange-100 text-orange-700'
                        : appointment.status === AppointmentStatus.Confirmado
                        ? 'bg-green-100 text-green-700'
                        : appointment.status === AppointmentStatus.Cancelado
                        ? 'bg-[#FEE2E2] text-[#B91C1C]'
                        : appointment.status === AppointmentStatus.Concluida
                        ? 'bg-[#D6EBF3] text-[#447F98]'
                        : ''
                    }
                  `}
                >
                  {appointment.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{appointment.service}</td>
              <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                {appointment.date.split('T')[0].split('-').reverse().join('-')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{appointment.clientName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{formatTime(appointment.time)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                {appointment.professional ? appointment.professional : 'Especialista eliminado'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-xs font-medium flex gap-2">
                {appointment.status === AppointmentStatus.Pendiente || appointment.status === AppointmentStatus.Confirmado || appointment.status === AppointmentStatus.Concluida ? (
                  <>
                    <button
                      onClick={() => openStatusModal(appointment)}
                      className="flex justify-center items-center gap-2 px-4 py-2 rounded-lg shadow-lg bg-[#D6EBF3] text-[#447F98] font-semibold text-xs hover:bg-[#B0E0E6] transition-colors "
                    >
                      <VscEdit className="text-sm text-[#447F98]" />
                      Estado
                    </button>
                    <button
                      onClick={() => openCancelModal(appointment)}
                      className="flex justify-center items-center gap-2 px-4 py-2 rounded-lg shadow-lg bg-[#FEE2E2] text-[#B91C1C] font-semibold text-xs hover:bg-[#FFC1C1] transition-colors"
                    >
                      <VscTrash className="text-sm text-[#B91C1C]" />
                      <span>Cancelar</span>
                    </button>
                  </>
                ) : (
                  <span className="text-gray-400 text-xs">Sin acciones</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <div className="flex justify-between items-center mt-6 px-4">
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg text-center text-xs shadow ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#D6EBF3] text-[#447F98] hover:bg-[#B0E0E6]'}`}
        >← Anterior</button>
        <span className="text-sm text-gray-600 text-center max-sm:text-xs max-sm:mx-1">
          Pág. {currentPage} de {totalPages}</span>
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg text-xs shadow ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#D6EBF3] text-[#447F98] hover:bg-[#B0E0E6]'}`}
        >Siguiente →</button>
      </div>

      {/* Modal para cambiar estado */}
      {showStatusModal && selectedAppointment && ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" style={{ fontFamily: 'Poppins, sans-serif'}}>
          <div className="bg-white rounded-3xl shadow-lg p-8 w-[90%] max-w-md">
            <div className="flex justify-center items-center mb-4">
              <h2 className="text-xl font-medium text-[#447F98]">Cambiar Estado</h2>
            </div>
            <ServiceFormField
              label="Nuevo estado:"
              name="newStatus"
              options={statusOptionsForModal}
              value={newStatus}
              placeholder='Seleccione un estado'
              onChange={handleStatusChange}
              whiteBg={false} 
              className="w-full mb-4"
            />
            <div className="flex flex-col sm:flex-row justify-center gap-2 text-sm mt-4">
              <button onClick={() => setShowStatusModal(false)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 w-full sm:w-auto">Cancelar</button>
              <button onClick={handleUpdateStatus} className="px-4 py-2 bg-[#447F98] text-white rounded-lg hover:bg-[#629BB5] w-full sm:w-auto">Actualizar</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal para cancelar cita */}
      {showCancelModal && selectedAppointment && ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" style={{ fontFamily: 'Poppins, sans-serif'}}>
          <div className="bg-white rounded-3xl shadow-lg p-8 w-[90%] max-w-md text-center">
            <h2 className="text-xl font-medium text-[#B91C1C] mb-4">Cancelar Cita</h2>
            <p className="mb-6 text-sm">¿Estás seguro que quieres cancelar esta cita?</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4  text-sm">
              <button onClick={() => setShowCancelModal(false)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 w-full sm:w-auto">No</button>
              <button onClick={handleCancelAppointment} className="px-4 py-2 bg-[#FEE2E2] text-[#B91C1C] rounded-lg hover:bg-[#FFC1C1] w-full sm:w-auto">Sí, Cancelar</button>
            </div>
          </div>
        </div>,
        document.body
      )}
      
    </div>
  );
};
