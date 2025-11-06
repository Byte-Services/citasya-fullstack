'use client';

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { VscChromeClose } from "react-icons/vsc";
import { ServiceFormField, SelectOption } from '../InputField';
import { toast } from 'react-hot-toast';

interface NewAppointmentProps {
  onClose: () => void;
  initialDocumentId?: string;
}

export const NewAppointment: React.FC<NewAppointmentProps> = ({ onClose, initialDocumentId }) => {
  const [formData, setFormData] = useState({
    clientDocumentId: initialDocumentId || '',
    specialtyId: '',
    serviceId: '',
    workerId: '',
    date: '',
    hour: '',
  });


  const [availableSpecialties, setAvailableSpecialties] = useState<SelectOption<string>[]>([]);
  const [availableServices, setAvailableServices] = useState<SelectOption<string>[]>([]);
  const [availableWorkers, setAvailableWorkers] = useState<SelectOption<string>[]>([]);
  interface Worker {
    id: number;
    name: string;
    services?: { id: number; name: string }[];
  }
  const [allWorkers, setAllWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL ?? ''}/admin`;
  const [availableHours, setAvailableHours] = useState<string[]>([]);

  // 1. Cargar todas las especialidades y todos los workers al iniciar
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Cargar especialidades
        const specialtiesResponse = await fetch(`${API_URL}/specialties`);
        if (!specialtiesResponse.ok) throw new Error('Error al obtener especialidades');
        const specialtiesData = await specialtiesResponse.json();
        const formattedSpecialties = specialtiesData.map((s: { id: number; name: string }) => ({
          value: s.id.toString(),
          label: s.name,
        }));
        setAvailableSpecialties(formattedSpecialties);

        // Cargar todos los workers
        const workersResponse = await fetch(`${API_URL}/workers`);
        if (!workersResponse.ok) throw new Error('Error al obtener especialistas');
        const workersData = await workersResponse.json();
        setAllWorkers(workersData);
      } catch {
        setError('No se pudieron cargar los datos iniciales.');
      }
    };
    fetchInitialData();
  }, [API_URL]);

  // 2. Cargar servicios según la especialidad seleccionada
  useEffect(() => {
    const fetchServices = async () => {
      if (formData.specialtyId) {
        try {
          const response = await fetch(`${API_URL}/services/specialty/${formData.specialtyId}`);
          if (!response.ok) throw new Error('Error al obtener servicios');
          const data = await response.json();
          const formattedServices = data.map((s: { id: number; name: string }) => ({
            value: s.id.toString(),
            label: s.name,
          }));
          setAvailableServices(formattedServices);
        } catch {
          setError('No se pudieron cargar los servicios de esta especialidad.');
        }
      } else {
        setAvailableServices([]);
      }
    };
    fetchServices();
  }, [formData.specialtyId, API_URL]);

  // 3. Filtrar workers según el servicio seleccionado
  useEffect(() => {
    if (formData.serviceId && allWorkers.length > 0) {
      // Filtrar workers que tengan el servicio seleccionado
      const filteredWorkers = allWorkers.filter(worker => 
        worker.services?.some((service: { id: number; name: string }) => 
          service.id.toString() === formData.serviceId
        )
      );
      
      // Formatear los workers filtrados
      const formattedWorkers = filteredWorkers.map((w: { id: number; name: string }) => ({
        value: w.id.toString(),
        label: w.name,
      }));
      
      setAvailableWorkers(formattedWorkers);
      
      // Mostrar mensaje si no hay workers para este servicio
      if (filteredWorkers.length === 0) {
        setError('No hay especialistas disponibles para este servicio.');
      } else {
        setError(null);
      }
    } else {
      setAvailableWorkers([]);
    }
  }, [formData.serviceId, allWorkers]);

  // 4. Resetear workerId si no está disponible para el nuevo servicio
  useEffect(() => {
    if (formData.workerId && availableWorkers.length > 0) {
      const isWorkerAvailable = availableWorkers.some(
        worker => worker.value === formData.workerId
      );
      
      if (!isWorkerAvailable) {
        setFormData(prev => ({ ...prev, workerId: '' }));
      }
    }
  }, [availableWorkers, formData.workerId]);
  
  // 5. Cargar horas disponibles según worker y fecha seleccionados
  useEffect(() => {
    const fetchSlots = async () => {
      if (formData.workerId && formData.date) {
        try {
          const response = await fetch(
            `${API_URL}/appointments/available-slots?workerId=${formData.workerId}&date=${formData.date}&serviceId=${formData.serviceId}`
          );
          if (!response.ok) throw new Error("Error obteniendo horarios disponibles");
          const data = await response.json();
          setAvailableHours(data.slots || []);
        } catch {
          setAvailableHours([]);
        }
      } else {
        setAvailableHours([]);
      }
    };
    fetchSlots();
  }, [formData.workerId, formData.date, formData.serviceId, API_URL]);
  
  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
      | { target: { name?: string; value: string | string[] } }
  ) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => {
        const newFormData = { ...prev, [name]: typeof value === 'string' ? value : value[0] };

        if (name === 'specialtyId') {
          newFormData.serviceId = '';
          newFormData.workerId = '';
        } else if (name === 'serviceId') {
          newFormData.workerId = '';
        }

        return newFormData;
      });
    }
  };

  const handleAddAppointment = async () => {
    setLoading(true);
    setError(null);
    try {
      const serviceId = parseInt(formData.serviceId);
      const workerId = parseInt(formData.workerId);

      // Validación de campos obligatorios
      if (!formData.clientDocumentId || isNaN(serviceId) || isNaN(workerId) || !formData.date || !formData.hour) {
        setError("Faltan datos obligatorios");
        setLoading(false);
        return;
      }

      // Validación de fecha futura
      const selectedDateTime = new Date(`${formData.date}T${formData.hour}`);
      const now = new Date();
      if (selectedDateTime < now) {
        setError("No se puede seleccionar una fecha/hora pasada");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientDocumentId: formData.clientDocumentId,
          serviceId,
          workerId,
          date: formData.date,
          hour: formData.hour,
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Error del servidor. Inténtalo de nuevo.');
      }

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || 'Error al crear la cita.');
      }

      toast.success(`Agregada correctamente la cita`);

      onClose();
      window.location.reload(); 
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes('Cliente no encontrado')) {
          setError('Cliente no registrado. Verifique el documento de identidad.');
        } else if (err.message.includes('Servicio no encontrado')) {
          setError('Servicio no disponible.');
        } else if (err.message.includes('Especialista no encontrado')) {
          setError('Especialista no disponible.');
        } else {
          setError(err.message || 'Error al crear la cita. Inténtalo de nuevo.');
        }
      } else {
        setError('Error al crear la cita. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };


  return ReactDOM.createPortal(
    <main className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="w-full max-w-2xl mx-auto sm:mx-4">
        <div className="flex flex-col py-6 px-4 sm:py-8 sm:px-10 md:px-12 w-full bg-neutral-100 rounded-2xl sm:rounded-[30px] shadow-2xl">
          <header className="flex justify-between items-center w-full mb-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium text-left text-[#447F98] flex-1" style={{ fontFamily: 'Roboto Condensed, sans-serif' }}>
              Nueva Cita
            </h1>
            <button
              onClick={onClose}
              aria-label="Cerrar modal"
              className="flex-1 text-right text-neutral-600 hover:text-neutral-800 transition-colors duration-200"
            >
              <VscChromeClose className="inline-block w-6 h-6" />
            </button>
          </header>
          <form className="flex flex-col w-full text-neutral-600">

            {error && <p className="text-red-500 text-center mb-3 text-sm sm:text-base">{error}</p>}

            <div className="flex flex-wrap gap-6 sm:gap-8 max-md:flex-col">
              <ServiceFormField
                label="Documento Cliente:"
                placeholder="Ingresa cédula o pasaporte..."
                type="text"
                name="clientDocumentId"
                value={formData.clientDocumentId || initialDocumentId || ''}
                onChange={handleChange}
                className="flex-1 w-full"
              />
              <ServiceFormField
                label="Especialidad:"
                placeholder="Selecciona una especialidad"
                options={availableSpecialties}
                name="specialtyId"
                value={formData.specialtyId}
                onChange={handleChange}
                className="flex-1 w-full"
              />
            </div>

            <div className="flex flex-wrap gap-6 sm:gap-8 mt-6 max-md:flex-col">
              <ServiceFormField
                label="Servicio:"
                placeholder="Selecciona un servicio"
                options={availableServices}
                name="serviceId"
                value={formData.serviceId}
                onChange={handleChange}
                className="flex-1 w-full"
              />
              <ServiceFormField
                label="Especialista:"
                placeholder="Selecciona un especialista"
                options={availableWorkers}
                name="workerId"
                value={formData.workerId}
                onChange={handleChange}
                className="flex-1 w-full"
              />
            </div>

            <div className="flex flex-wrap gap-6 sm:gap-8 mt-6 max-md:flex-col">
              <ServiceFormField
                label="Fecha:"
                placeholder="Selecciona una fecha"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="flex-1 w-full"
              />
              <ServiceFormField
                label="Hora:"
                placeholder="Selecciona una hora"
                options={availableHours.map(h => ({ value: h, label: h }))}
                name="hour"
                value={formData.hour}
                onChange={handleChange}
                className="flex-1 w-full"
              />
            </div>

            <button
              onClick={e => { e.preventDefault(); handleAddAppointment(); }}
              type="button"
              className="w-full sm:w-auto self-center px-8 py-4 mt-8 text-sm sm:text-base font-bold text-white bg-[#447F98] rounded-3xl shadow-md hover:bg-[#629BB5] transition-colors duration-200 disabled:opacity-60"
              style={{ fontFamily: 'Poppins, sans-serif' }}
              disabled={loading}
            >
              <span>{loading ? 'Agregando...' : 'Agregar'}</span>
            </button>
          </form>
        </div>
      </div>
    </main>,
    document.body
  );
};