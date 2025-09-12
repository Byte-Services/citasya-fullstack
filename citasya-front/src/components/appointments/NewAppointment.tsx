'use client';

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { VscChromeClose } from "react-icons/vsc";
import { ServiceFormField, SelectOption } from '../InputField';

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
  const [allWorkers, setAllWorkers] = useState<Worker[]>([]); // Nuevo estado
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
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
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
        } catch (err) {
          console.error('Failed to fetch services:', err);
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
          const response = await fetch(`${API_URL}/appointments/available-slots?workerId=${formData.workerId}&date=${formData.date}`);
          if (!response.ok) throw new Error("Error obteniendo horarios disponibles");
          const data = await response.json();
          setAvailableHours(data.slots || []);
        } catch (err) {
          console.error(err);
          setAvailableHours([]);
        }
      } else {
        setAvailableHours([]);
      }
    };
    fetchSlots();
  }, [formData.workerId, formData.date, API_URL]);
  
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
        const text = await response.text();
        console.error('Respuesta no JSON:', text.substring(0, 200));
        throw new Error('Error del servidor. Inténtalo de nuevo.');
      }

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || 'Error al crear la cita.');
      }

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
    <main className="fixed inset-0 z-50 flex items-center justify-center " style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-2xl w-full mx-4 sm:mx-6 md:mx-auto">
        <div className="flex flex-col py-9 px-6 sm:px-10 md:px-12 w-full bg-neutral-100 rounded-[30px] shadow-2xl">
          <header className="flex justify-between items-center w-full">
            <div className="flex-1"></div>
            <h1 className="text-4xl font-medium leading-none text-center text-[#447F98]" style={{ fontFamily: 'Roboto Condensed, sans-serif' }}>
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
          <form className="flex flex-col mt-8 w-full text-neutral-600">
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            
            <div className="flex flex-wrap gap-10 max-md:flex-col">
              <ServiceFormField
                label="Documento Cliente:"
                placeholder="Ingresa cédula o pasaporte..."
                type="text"
                name="clientDocumentId"
                value={formData.clientDocumentId || initialDocumentId || ''}
                onChange={handleChange}
                className="flex-1 grow shrink-0 basis-0 w-fit"
              />
              <ServiceFormField
                label="Especialidad:"
                placeholder="Selecciona una especialidad"
                options={availableSpecialties}
                name="specialtyId"
                value={formData.specialtyId}
                onChange={handleChange}
                className="flex-1 grow shrink-0 basis-0 w-fit"
              />
            </div>

            <div className="flex flex-wrap gap-10 mt-6 max-md:flex-col">
              <ServiceFormField
                label="Servicio:"
                placeholder="Selecciona un servicio"
                options={availableServices}
                name="serviceId"
                value={formData.serviceId}
                onChange={handleChange}
                className="flex-1 grow shrink-0 basis-0 w-fit"
              />
              <ServiceFormField
                label="Especialista:"
                placeholder="Selecciona un especialista"
                options={availableWorkers}
                name="workerId"
                value={formData.workerId}
                onChange={handleChange}
                className="flex-1 grow shrink-0 basis-0 w-fit"
              />
            </div>

            <div className="flex flex-wrap gap-10 mt-6 max-md:flex-col">
              <ServiceFormField
                label="Fecha:"
                placeholder="Selecciona una fecha"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="flex-1 grow shrink-0 basis-0 w-fit"
              />
              <ServiceFormField
                label="Hora:"
                placeholder="Selecciona una hora"
                options={availableHours.map(h => ({ value: h, label: h }))}
                name="hour"
                value={formData.hour}
                onChange={handleChange}
                className="flex-1 grow shrink-0 basis-0 w-fit"
              />
            </div>

            <button
              onClick={e => { e.preventDefault(); handleAddAppointment(); }}
              type="button"
              className="flex justify-center self-center px-11 py-5 mt-10 max-w-full text-sm font-bold text-center text-white bg-[#447F98] rounded-[40px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] w-[149px] max-md:px-5 hover:bg-[#629BB5] transition-colors duration-200"
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