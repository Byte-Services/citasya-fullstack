'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { ServiceFormField } from '../../components/InputField';
import { AppointmentsTable } from '../../components/appointments/AppointmentsTable';
import { VscAdd, VscRefresh } from "react-icons/vsc";
import { NewAppointment } from '../../components/appointments/NewAppointment';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

interface Client {
  name: string;
}

interface Worker {
  name: string;
}

interface Service {
  name: string;
}

enum AppointmentStatus {
  Pendiente = "Pendiente",
  Confirmado = "Confirmado",
  Cancelado = "Cancelado",
  Concluida = "Concluida"
}

interface Appointment {
  id: number;
  date: string;
  hour: string;
  status: AppointmentStatus;
  client: Client;
  worker: Worker | null;
  service: Service;
}


const Appointments: React.FC = () => {
  useAuthRedirect();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedEspecialista, setSelectedEspecialista] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workersForFilter, setWorkersForFilter] = useState<{ label: string; value: string; }[]>([]);
  const [servicesForFilter, setServicesForFilter] = useState<{ label: string; value: string; }[]>([]);
  const [date, setDate] = useState('');

  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

  const appointmentStatusOptions = [
    { label: 'Todos', value: '' },
    { label: 'Pendiente', value: AppointmentStatus.Pendiente },
    { label: 'Confirmado', value: AppointmentStatus.Confirmado },
    { label: 'Cancelado', value: AppointmentStatus.Cancelado },
    { label: 'Concluida', value: AppointmentStatus.Concluida },
  ];

  // Función para traer especialistas desde la base de datos
  const fetchWorkers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/workers`);
      if (!res.ok) throw new Error(`Error fetching workers: ${res.statusText}`);
      const workersData: Worker[] = await res.json();
      const workerOptions = [{ label: 'Todos', value: '' }, ...workersData.map(w => ({ label: w.name, value: w.name }))];
      setWorkersForFilter(workerOptions);
    } catch {
      setWorkersForFilter(prev => prev); 
    }
  }, [API_BASE]);

  // Función para traer servicios desde la base de datos
  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/services`);
      if (!res.ok) throw new Error(`Error fetching services: ${res.statusText}`);
      const servicesData: Service[] = await res.json();
      const serviceOptions = [{ label: 'Todos', value: '' }, ...servicesData.map(s => ({ label: s.name, value: s.name }))];
      setServicesForFilter(serviceOptions);
    } catch {
      setServicesForFilter(prev => prev); 
    }
  }, [API_BASE]);


  // La función de obtención de datos
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const appointmentsRes = await fetch(`${API_BASE}/admin/appointments`);

      if (!appointmentsRes.ok) {
        throw new Error(`Error fetching appointments: ${appointmentsRes.statusText}`);
      }

      const appointmentsData = await appointmentsRes.json();
      setAppointments(appointmentsData);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch data from backend.');
      }
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchData();
    fetchWorkers();
    fetchServices();
  }, [fetchData, fetchWorkers, fetchServices]);


  // Lógica de filtrado de citas
  const filteredAppointments = appointments.filter(appointment => {
    const statusMatch = selectedStatus === '' || appointment.status.toLowerCase() === selectedStatus.toLowerCase();
    const especialistaMatch = selectedEspecialista === '' || (appointment.worker?.name ?? '').toLowerCase() === selectedEspecialista.toLowerCase();
    const serviceMatch = selectedService === '' || appointment.service.name.toLowerCase() === selectedService.toLowerCase();
    const searchMatch = searchTerm === '' || appointment.client.name.toLowerCase().includes(searchTerm.toLowerCase());
    const dateMatch = date === '' || appointment.date === date;

    return statusMatch && especialistaMatch && serviceMatch && searchMatch && dateMatch;
  });

  const handleOpenNewModal = () => setShowNewModal(true);
  const handleCloseNewModal = () => {
    setShowNewModal(false); 
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE}/admin/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Error actualizando estado');

      const updatedAppointment = await res.json();

      setAppointments(prev =>
        prev.map(a => (a.id === updatedAppointment.id ? updatedAppointment : a))
      );

    } catch {
      setError('Error actualizando estado');
    }
  };


  const googleCalendarEmbedUrl = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_URL;

  // Handler para el cambio de fecha
  const handleDateChange = (
    e:
      | React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>
      | { target: { name?: string; value: string | string[] } }
  ) => {
    if ("target" in e && typeof e.target.value !== "undefined") {
      if (Array.isArray(e.target.value)) {
        setDate(e.target.value[0]);
      } else {
        setDate(e.target.value);
      }
    }
  };

  return (
    <>
      <main className="container pl-30 pr-30 mx-auto max-md:px-5 max-sm:px-2.5 bg-[#F9FAFB] pt-8"  style={{ fontFamily: 'Poppins, sans-serif'}}>
        <div className= "bg-white p-10 rounded-lg shadow">
          <div className="flex justify-between items-center mb-5">
              <h2 className="mx-0 text-2xl font-medium text-[#447F98] max-sm:text-2xl">
                Calendario
              </h2>
              <button
                  onClick={fetchData} 
                  className="flex gap-2 justify-between px-4 py-2 rounded-lg bg-[#D6EBF3] text-[#447F98] font-semibold text-sm hover:bg-[#B9D8E1] transition-colors"
              >
                <VscRefresh className='text-[#447F98] text-lg'/>
                Refrescar datos
              </button>
          </div>

          {loading && <p className="text-center text-gray-500">Cargando calendario...</p>}
          {error && <p className="text-center text-red-500">Error: {error}</p>}

          {!loading && !error && (
              <div className="w-full mb-8" style={{ height: '700px' }}>
                  <iframe
                      src={googleCalendarEmbedUrl}
                      style={{ border: '0', width: '100%', height: '100%' }}
                      frameBorder="0"
                      scrolling="no"
                      title="Google Calendar"
                  />
              </div>
          )}  
        </div>

        <div className= "bg-white p-10 rounded-lg shadow mt-8">
          <div className="flex justify-between items-center">
            <h2 className="mx-0 text-2xl font-medium text-[#447F98] max-sm:text-2xl">
              Historial de Citas
            </h2>
              <button
                onClick={handleOpenNewModal}
                className="bg-[#447F98] hover:bg-[#629BB5] text-sm text-white py-2 px-4 gap-2 rounded-md flex items-center whitespace-nowrap"
              >
              <VscAdd className="h-5 w-5 mr-1" />
              <span>Nueva Cita</span>
              </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-6 max-md:justify-center mt-4">
              <div className="w-[190px]">
                <ServiceFormField
                  label="Estado cita:"
                  placeholder="Selecciona un estado"
                  options={appointmentStatusOptions}
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(Array.isArray(e.target.value) ? e.target.value[0] : e.target.value)}
                />
              </div>
              <div className="w-[210px]">
                <ServiceFormField
                  label="Especialista:"
                  placeholder="Selecciona un especialista"
                  options={workersForFilter} 
                  value={selectedEspecialista}
                  onChange={(e) => setSelectedEspecialista(Array.isArray(e.target.value) ? e.target.value[0] : e.target.value)}
                />
              </div>
              <div className="w-[190px]">
                <ServiceFormField
                  label="Servicio:"
                  placeholder="Selecciona un servicio"
                  options={servicesForFilter}
                  value={selectedService}
                  onChange={(e) => setSelectedService(Array.isArray(e.target.value) ? e.target.value[0] : e.target.value)}
                />
              </div>
              <div className="w-[190px]">
                <ServiceFormField
                  label="Fecha:"
                  placeholder="Selecciona una fecha"
                  type="date"
                  name="date"
                  value={date}
                  onChange={handleDateChange}
                  className="gap-2"
                />
              </div>
              <div className="relative w-[250px] mt-7 ml-15 text-neutral-600">
                <ServiceFormField
                  type="text"
                  placeholder="Buscar por cliente"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(Array.isArray(e.target.value) ? e.target.value[0] : e.target.value)} 
                  label=""
                  className="rounded-lg text-neutral-600" 
                />
              </div>
            </div>

          </div>

          {loading && <p className="text-center text-gray-500">Cargando tabla de citas...</p>}
          {error && <p className="text-center text-red-500">Error: {error}</p>}

          {!loading && !error && (
              <AppointmentsTable
                appointments={filteredAppointments.map(a => ({
                  id: a.id.toString(),
                  status: a.status,
                  service: a.service.name,
                  date: a.date,
                  time: a.hour,
                  clientName: a.client.name,
                  professional: a.worker?.name || 'Especialista eliminado',
                }))}
                onUpdateStatus={handleUpdateStatus}
              />
          )}
        </div>
        <div className="pb-15" />
      </main>

      {/* Modal de nuevo servicio */}
        {showNewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-300/50 backdrop-blur-sm">
            <NewAppointment onClose={handleCloseNewModal} />
          </div>
      )}
    </>
  );
};

export default Appointments;
