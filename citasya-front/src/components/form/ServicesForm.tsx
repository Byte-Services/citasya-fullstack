import React, { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { useServiceStore } from '@/store/serviceStore';
import { CreateServiceRequest, UpdateServiceRequest } from '@/interfaces/service';

export interface ServiceFormValues {
  name: string;
  category: string;
  duration: string;
  price: string;
  description: string;
}

interface ServicesFormProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  initialValues: ServiceFormValues;
  editingServiceId: number | null;
  onSuccess: (values: ServiceFormValues) => void;
}

const durationToMinutes = (duration: string) => {
  const parsed = parseInt(duration, 10);
  return Number.isNaN(parsed) ? 60 : parsed;
};

export default function ServicesForm({
  isOpen,
  onClose,
  categories,
  initialValues,
  editingServiceId,
  onSuccess,
}: ServicesFormProps) {
  const { createService, updateService } = useServiceStore();
  const [formData, setFormData] = useState<ServiceFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(initialValues);
      setErrors({});
    }
  }, [initialValues, isOpen]);

  const serviceMutation = useMutation({
    mutationFn: async (values: ServiceFormValues) => {
      const specialtyIndex = categories.findIndex((cat) => cat === values.category);
      const specialtyId = specialtyIndex >= 0 ? specialtyIndex + 1 : 1;

      const payload: CreateServiceRequest | UpdateServiceRequest = {
        name: values.name,
        description: values.description,
        minutes_duration: durationToMinutes(values.duration),
        price: Number(values.price),
        status: 'active',
        specialty_id: specialtyId,
      };

      if (editingServiceId) {
        await updateService(editingServiceId, payload as UpdateServiceRequest);
      } else {
        await createService(payload as CreateServiceRequest);
      }
    },
    onSuccess: (_, values) => {
      onSuccess(values);
      onClose();
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!formData.name.trim()) nextErrors.name = 'Requerido';
    if (!formData.category) nextErrors.category = 'Requerido';
    if (!formData.price || Number.isNaN(Number(formData.price))) {
      nextErrors.price = 'Precio inválido';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    serviceMutation.mutate(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingServiceId ? 'Editar Servicio' : 'Nuevo Servicio'}
      onSubmit={handleSubmit}
      submitLabel={serviceMutation.isPending ? 'Guardando...' : 'Guardar'}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nombre del Servicio <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-rose-500' : 'border-gray-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Categoría / Especialidad <span className="text-rose-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-xl border ${errors.category ? 'border-rose-500' : 'border-gray-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white`}
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Duración
            </label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
            >
              <option value="30 min">30 min</option>
              <option value="45 min">45 min</option>
              <option value="60 min">60 min</option>
              <option value="90 min">90 min</option>
              <option value="120 min">120 min</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Precio ($) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className={`w-full px-4 py-3 rounded-xl border ${errors.price ? 'border-rose-500' : 'border-gray-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white`}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Descripción
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white resize-none"
          />
        </div>

        {serviceMutation.isError && (
          <p className="text-sm text-rose-600">
            No se pudo guardar el servicio. Inténtalo de nuevo.
          </p>
        )}
      </div>
    </Modal>
  );
}
