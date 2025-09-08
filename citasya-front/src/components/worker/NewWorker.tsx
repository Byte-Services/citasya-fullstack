'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { VscChromeClose } from "react-icons/vsc";
import { ServiceFormField, SelectOption } from '../InputField';
import {Specialty, Service, Specialist } from '../../types/worker';


interface NewSpecialistProps {
  onClose: () => void;
  onWorkerAdded: (newSpecialist: Specialist) => void;  
}

export const NewSpecialist: React.FC<NewSpecialistProps> = ({ onClose, onWorkerAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    documentId: '',
    phone: '',
    email: '',
    status: 'Activo',
    services: [] as number[],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableSpecialties, setAvailableSpecialties] = useState<SelectOption<number>[]>([]);
  const [availableServices, setAvailableServices] = useState<SelectOption<number>[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<number[]>([]);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/specialties`);
        if (!response.ok) {
          throw new Error('Error al obtener las especialidades');
        }
        const data: Specialty[] = await response.json();
        const formattedSpecialties: SelectOption<number>[] = data.map((specialty) => ({
          value: specialty.id,
          label: specialty.name,
        }));
        setAvailableSpecialties(formattedSpecialties);
      } catch (err) {
        console.error('Failed to fetch specialties:', err);
        setError('No se pudieron cargar las especialidades. Inténtalo de nuevo.');
      }
    };
    fetchSpecialties();
  }, []);

  useEffect(() => {
    if (selectedSpecialties.length > 0) {
      const fetchServicesBySpecialties = async () => {
        try {
          const allServices: Service[] = [];
          for (const specialtyId of selectedSpecialties) {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/services/specialty/${specialtyId}`
            );
            if (!response.ok) {
              throw new Error(`Error al obtener servicios de la especialidad ${specialtyId}`);
            }
            const data: Service[] = await response.json();
            allServices.push(...data);
          }
          const uniqueServices = Array.from(
            new Map(allServices.map(s => [s.id, s])).values()
          );
          const formattedServices: SelectOption<number>[] = uniqueServices.map(service => ({
            value: service.id,
            label: service.name,
          }));
          setAvailableServices(formattedServices);
        } catch (err) {
          console.error('Failed to fetch services:', err);
          setError('No se pudieron cargar los servicios. Inténtalo de nuevo.');
        }
      };
      fetchServicesBySpecialties();
    } else {
      setAvailableServices([]);
      setFormData(prev => ({ ...prev, services: [] })); 
    }
  }, [selectedSpecialties]);

  const handleSpecialtyChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> 
      | { target: { name?: string; value: number | number[] } }
  ) => {
    if ("target" in e && e.target instanceof HTMLSelectElement) {
      const values = Array.from(e.target.selectedOptions, opt => Number(opt.value));
      setSelectedSpecialties(values);
      setFormData(prev => ({ ...prev, services: [] }));
    } else if ("target" in e) {
      const value = Array.isArray(e.target.value) ? e.target.value.map(Number) : [Number(e.target.value)];
      setSelectedSpecialties(value);
      setFormData(prev => ({ ...prev, services: [] }));
    }
  };

  const handleServicesChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> 
      | { target: { name?: string; value: number | number[] } }
  ) => {
    if ("target" in e && e.target instanceof HTMLSelectElement) {
      const values = Array.from(e.target.selectedOptions, opt => Number(opt.value));
      setFormData(prev => ({ ...prev, services: values }));
    } else if ("target" in e) {
      const value = Array.isArray(e.target.value) ? e.target.value.map(Number) : [Number(e.target.value)];
      setFormData(prev => ({ ...prev, services: value }));
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name?: string; value: string | string[] } }
  ) => {
    const { name, value } = e.target;
    if (!name) return;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSpecialist = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/workers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          documentId: formData.documentId,
          phone: formData.phone,
          email: formData.email,
          status: formData.status,
          services: formData.services.map(id => ({ id })),
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData?.message || 'Error al crear el especialista');
      }

      onWorkerAdded(responseData as Specialist);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Error al crear el especialista');
    } finally {
      setLoading(false);
    }
  };



  return (
    <main className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" style={{ fontFamily: 'Poppins, sans-serif'}}>
      <div className="max-w-xl w-full mx-4 sm:mx-6 md:mx-auto">
        <div className="flex flex-col py-9 px-6 sm:px-10 md:px-12 w-full bg-neutral-100 rounded-[30px] shadow-2xl">
          <header className="flex justify-between items-center w-full">
            <div className="flex-1"></div>
            <h1 className="text-4xl font-medium leading-none text-center text-[#447F98]" style={{ fontFamily: 'Roboto Condensed, sans-serif' }}>
              Nuevo Especialista
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
            <div className="flex flex-wrap gap-10 max-md:flex-col">
              <ServiceFormField<string>
                label="Nombre del especialista:"
                placeholder="Ingresa nombre..."
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="flex-1 grow shrink-0 basis-0 w-fit"
              />
              <ServiceFormField<string>
                label="Cédula:"
                placeholder="Ingresa cédula..."
                type="text"
                name="documentId"
                value={formData.documentId}
                onChange={handleChange}
                className="flex-1 grow shrink-0 basis-0 w-fit"
              />
            </div>

            <div className="flex flex-wrap gap-10 mt-6 max-md:flex-col">
              <ServiceFormField<string>
                label="Teléfono:"
                placeholder="xxxxxxxxxx"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="flex-1 grow shrink-0 basis-0 w-fit"
              />
              <ServiceFormField<string>
                label="Email:"
                placeholder="xxxxxxxxxx"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="flex-1 grow shrink-0 basis-0 w-fit"
              />
            </div>

            <div className="flex flex-wrap gap-10 mt-6 max-md:flex-col">
              <ServiceFormField<number>
                label="Especialidades:"
                options={availableSpecialties}
                multiple
                value={selectedSpecialties}
                onChange={handleSpecialtyChange}
                placeholder="Selecciona especialidades"
                className="flex-1 grow shrink-0 basis-0 w-fit"
              />

              <ServiceFormField<number>
                label="Servicios:"
                options={availableServices}
                multiple
                value={formData.services}
                onChange={handleServicesChange}
                placeholder="Selecciona servicios"
                className="flex-1 grow shrink-0 basis-0 w-fit"
                disabled={selectedSpecialties.length === 0}
              />
            </div>

            {error && <p className="mt-4 text-red-500 text-center">{error}</p>}

            <button
              onClick={handleAddSpecialist}
              type="button"
              className="flex justify-center self-center px-11 py-5 mt-10 max-w-full text-sm font-semibold text-center text-white whitespace-nowrap bg-[#447F98] rounded-[40px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] w-[149px] max-md:px-5 hover:bg-[#629BB5] transition-colors duration-200"
              style={{ fontFamily: 'Poppins, sans-serif' }}
              disabled={loading}
            >
              <span>{loading ? 'Agregando...' : 'Agregar'}</span>
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};
