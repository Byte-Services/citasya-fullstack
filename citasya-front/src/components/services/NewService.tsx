'use client';

import React, { useState } from 'react';
import { ServiceFormField } from '../InputField';
import { VscChromeClose } from "react-icons/vsc";
import { SpecialtyData } from '../../types/service';
import { toast } from 'react-hot-toast/headless';

interface NewServiceProps {
  onClose: () => void;
  specialties: SpecialtyData[];
}

export const NewService: React.FC<NewServiceProps> = ({ onClose, specialties }) => {
  const [formData, setFormData] = useState({
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
    if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio";
    if (!formData.specialty_id) newErrors.specialty_id = "La especialidad es obligatoria";
    if (!formData.description.trim()) newErrors.description = "La descripción es obligatoria";
    if (!formData.minutes_duration) newErrors.minutes_duration = "La duración es obligatoria";
    if (!formData.price) newErrors.price = "El precio es obligatorio";

    setErrors(newErrors);
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
    <main
      className="max-w-[800px]" style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      <div className="flex flex-col py-9 w-full bg-neutral-100 rounded-[30px] shadow-lg">
        <header className="flex flex-col self-end mr-11 text-4xl font-medium leading-none text-center text-stone-400 w-[404px]">
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="self-end w-[25px] h-[25px] cursor-pointer"
          >
            <VscChromeClose className="text-neutral-600 hover:text-neutral-800 transition-colors" />
          </button>
          <h1 className="self-center text-[#447F98]" style={{ fontFamily: 'Roboto Condensed' }}>Nuevo Servicio</h1>
        </header>

        <form className="flex flex-col px-10 mt-8 w-full text-neutral-600">

          <div className="flex flex-wrap gap-10">
            <div className="flex flex-col flex-1">
              <ServiceFormField
                  label="Nombre del servicio:"
                  placeholder="Ingresa nombre..."
                  className="flex-1"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
            </div>
            <div className="flex flex-col flex-1">
              <ServiceFormField
                label="Especialidad:"
                placeholder="Selecciona una especialidad"
                options={specialties.map(s => ({ value: s.id.toString(), label: s.name }))} 
                className="flex-1"
                name="specialty_id"
                value={formData.specialty_id} 
                onChange={handleChange}
              />
              {errors.specialty_id && <p className="text-red-500 text-xs">{errors.specialty_id}</p>}
            </div>
          </div>
          <div className="flex flex-col flex-1">
            <ServiceFormField
              label="Descripción"
              placeholder="Escribe una descripción del servicio..."
              type="textarea"
              className="mt-1"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
            {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
          </div>
          <div className="flex flex-wrap gap-10 mt-6">
            <div className="flex flex-col flex-1">
              <ServiceFormField
                label="Duración (min):"
                placeholder="Ej: 60"
                type="number"
                className="flex-1"
                name="minutes_duration"
                value={formData.minutes_duration}
                onChange={handleChange}
              />
              {errors.minutes_duration && <p className="text-red-500 text-xs">{errors.minutes_duration}</p>}
            </div>
            <div className="flex flex-col flex-1">
              <ServiceFormField
                label="Precio ($):"
                placeholder="Ej: 50.00"
                type="number"
                className="flex-1"
                name="price"
                value={formData.price}
                onChange={handleChange}
              />
              {errors.price && <p className="text-red-500 text-xs">{errors.price}</p>}
            </div>
          </div>

          <ServiceFormField
            label="Estado:"
            placeholder="Selecciona un estado"
            options={statusOptions}
            className="flex-1"
            name="status"
            value={formData.status}
            onChange={handleChange}
          />
          {error && <p className="text-red-500 text-center text-sm mt-4">{error}</p>}

          <button
            onClick={handleAddService}
            type="button"
            className="self-center px-11 py-5 mt-8 text-base font-bold text-white bg-[#447F98] rounded-[40px] hover:bg-[#629BB5] transition-colors"
            disabled={loading}
          >
            {loading ? 'Agregando...' : 'Agregar'}
          </button>
        </form>
      </div>
    </main>
  );
};
