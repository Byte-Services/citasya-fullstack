'use client';

import React, { useState } from 'react';
import { ServiceFormField } from '../InputField';
import { VscChromeClose } from "react-icons/vsc";
import { SpecialtyData } from '../../types/service';
import { toast } from 'react-hot-toast';

interface NewServiceProps {
  onClose: () => void;
  specialties: SpecialtyData[];
}

type FormDataType = {
  name: string;
  specialty_id: string;
  description: string;
  minutes_duration: string;
  price: string;
  status: string;
};

export const NewService: React.FC<NewServiceProps> = ({ onClose, specialties }) => {
  const [formData, setFormData] = useState<FormDataType>({
    name: '',
    specialty_id: '', 
    description: '',
    minutes_duration: '',
    price: '',
    status: 'Activo',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL ?? ''}/admin`;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (formData.minutes_duration && (!/^\d+$/.test(formData.minutes_duration) || parseInt(formData.minutes_duration, 10) <= 0)) {
      newErrors.minutes_duration = "La duración debe ser un número entero mayor que 0";
    }
    if (formData.price && (isNaN(Number(formData.price)) || Number(formData.price) <= 0)) {
      newErrors.price = "El precio debe ser un número mayor que 0";
    }

    const requiredFields: (keyof FormDataType)[] = ['name', 'specialty_id', 'description', 'minutes_duration', 'price'];
    const hasEmptyRequired = requiredFields.some((field) => {
      const value = formData[field];
      return value === undefined || value === null || String(value).trim() === '';
    });

    setErrors(newErrors);

    if (hasEmptyRequired) {
      setError('Todos los campos son obligatorios');
      return false;
    }

    setError(null);
    return Object.keys(newErrors).length === 0;
  };


  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
      | { target: { name?: string; value: string | string[] } }
  ) => {
    const { name, value } = e.target;
    if (!name) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddService = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        specialty_id: parseInt(formData.specialty_id, 10), 
        minutes_duration: parseInt(formData.minutes_duration, 10),
        price: parseFloat(formData.price),
      };

      const response = await fetch(`${API_URL}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al agregar el servicio');
      }

      toast.success(`Agregado correctamente el Servicio ${formData.name}`);


      await response.json();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido al agregar el servicio");
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = ['Activo', 'Inactivo'].map(option => ({
    value: option,
    label: option,
  }));

  return (
    <main className="max-w-[800px] w-full mx-4 sm:mx-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="flex flex-col py-6 sm:py-9 w-full bg-neutral-100 rounded-[15px] sm:rounded-[30px] shadow-lg max-h-[95vh] overflow-y-auto">
        <header className="flex flex-col px-4 sm:px-10 self-stretch text-xl sm:text-4xl font-medium leading-none text-center text-stone-400">
          <div className="flex justify-between items-start mb-4 sm:mb-0">
            <h1 className="text-[#447F98] text-2xl sm:text-4xl" style={{ fontFamily: 'Roboto Condensed' }}>Nuevo Servicio</h1>
            <button
              onClick={onClose}
              aria-label="Cerrar modal"
              className="w-[30px] h-[30px] cursor-pointer self-start"
            >
              <VscChromeClose className="text-2xl sm:text-4xl text-neutral-600 hover:text-neutral-800 transition-colors" />
            </button>
          </div>
        </header>

        <form className="flex flex-col px-4 sm:px-10 mt-4 sm:mt-8 w-full text-neutral-600">
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-10">
            <div className="flex flex-col flex-1 min-w-full sm:min-w-0">
              <ServiceFormField
                label="Nombre del servicio:"
                placeholder="Ingresa nombre..."
                className="flex-1"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col flex-1 min-w-full sm:min-w-0">
              <ServiceFormField
                label="Especialidad:"
                placeholder="Selecciona una especialidad"
                options={specialties.map(s => ({ value: s.id.toString(), label: s.name }))} 
                className="flex-1"
                name="specialty_id"
                value={formData.specialty_id} 
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex flex-col flex-1 mt-4 sm:mt-0">
            <ServiceFormField
              label="Descripción"
              placeholder="Escribe una descripción del servicio..."
              type="textarea"
              className="mt-1"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-10 mt-4 sm:mt-6">
            <div className="flex flex-col flex-1 min-w-full sm:min-w-0">
              <ServiceFormField
                label="Duración (min):"
                placeholder="Ej: 60"
                type="number"
                className="flex-1"
                name="minutes_duration"
                value={formData.minutes_duration}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col flex-1 min-w-full sm:min-w-0">
              <ServiceFormField
                label="Precio ($):"
                placeholder="Ej: 50.00"
                type="number"
                className="flex-1"
                name="price"
                value={formData.price}
                onChange={handleChange}
              />
            </div>
          </div>

          <ServiceFormField
            label="Estado:"
            placeholder="Selecciona un estado"
            options={statusOptions}
            className="flex-1 mt-4" 
            name="status"
            value={formData.status}
            onChange={handleChange}
          />

          {(error || Object.keys(errors).length > 0) && (
            <div className="mt-6 px-4 py-3 text-red-700 rounded-md">
              <ul className="text-sm list-disc list-inside space-y-1">
                {error && <li>{error}</li>}
                {Object.entries(errors).map(([key, msg]) => (
                  <li key={key}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={handleAddService}
            type="button"
            className="self-center px-8 py-3 sm:px-11 sm:py-5 mt-6 sm:mt-8 text-base font-bold text-white bg-[#447F98] rounded-[40px] hover:bg-[#629BB5] transition-colors w-full sm:w-auto"
            disabled={loading}
          >
            {loading ? 'Agregando...' : 'Agregar'}
          </button>
        </form>
      </div>
    </main>
  );
};