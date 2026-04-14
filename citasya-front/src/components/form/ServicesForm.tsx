import React, { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import Input from '@/components/common/Input';
import Dropdown from '@/components/common/Dropdown';
import { Modal } from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';
import { useServiceStore } from '@/store/serviceStore';
import { CreateServiceRequest, UpdateServiceRequest } from '@/interfaces/service';
import { Specialty } from '@/interfaces/specialty';
import { sanitizeDecimalValue } from '@/utils/formValidation';

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
  specialties: Specialty[];
  categories: string[];
  initialValues: ServiceFormValues;
  editingServiceId: number | null;
  onSuccess: (values: ServiceFormValues) => void | Promise<void>;
}

const durationToMinutes = (duration: string) => {
  const parsed = parseInt(duration, 10);
  return Number.isNaN(parsed) ? 60 : parsed;
};

export default function ServicesForm({
  isOpen,
  onClose,
  specialties,
  categories,
  initialValues,
  editingServiceId,
  onSuccess,
}: ServicesFormProps) {
  const { createService, updateService } = useServiceStore();
  const [toast, setToast] = useState<{
    open: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    open: false,
    type: 'success',
    message: '',
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (isOpen) {
      reset(initialValues);
      clearErrors();
    }
  }, [initialValues, isOpen, reset, clearErrors]);

  const serviceMutation = useMutation({
    mutationFn: async (values: ServiceFormValues) => {
      const selectedSpecialty = specialties.find(
        (specialty) => specialty.name === values.category,
      );

      if (!selectedSpecialty) {
        throw new Error('Especialidad invalida');
      }

      const payload: CreateServiceRequest | UpdateServiceRequest = {
        name: values.name,
        description: values.description,
        minutes_duration: durationToMinutes(values.duration),
        price: Number(values.price),
        status: 'active',
        specialty_id: selectedSpecialty.id,
      };

      if (editingServiceId) {
        await updateService(editingServiceId, payload as UpdateServiceRequest);
      } else {
        await createService(payload as CreateServiceRequest);
      }
    },
  });

  const onSubmit = async (formData: ServiceFormValues) => {
    clearErrors('root');

    try {
      await serviceMutation.mutateAsync(formData);
      setToast({
        open: true,
        type: 'success',
        message: editingServiceId
          ? 'Servicio actualizado correctamente.'
          : 'Servicio creado correctamente.',
      });
      await Promise.resolve(onSuccess(formData));
      onClose();
    } catch {
      setToast({
        open: true,
        type: 'error',
        message: 'No se pudo guardar el servicio.',
      });
      // keep modal open and show existing error message
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={editingServiceId ? 'Editar Servicio' : 'Nuevo Servicio'}
        onSubmit={handleSubmit(onSubmit)}
        submitLabel={serviceMutation.isPending ? 'Guardando...' : 'Guardar'}
        noValidate
        isSubmitting={serviceMutation.isPending}
      >
        <div className="space-y-4">
          <Input
            label="Nombre del Servicio"
            placeholder="Ej. Limpieza facial"
            error={errors.name?.message}
            {...register('name', {
              required: 'El nombre es requerido',
              setValueAs: (value: string) => value,
              validate: (value) => value.trim().length > 0 || 'El nombre es requerido',
            })}
          />

          <Controller
            name="category"
            control={control}
            rules={{ required: 'La categoría es requerida' }}
            render={({ field }) => (
              <Dropdown
                name={field.name}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                options={categories}
                placeholder="Selecciona una categoría"
                label="Categoría / Especialidad"
                required
                error={Boolean(errors.category)}
                errorMessage={errors.category?.message}
              />
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="duration"
              control={control}
              render={({ field }) => (
                <Dropdown
                  name={field.name}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  options={["30 min", "45 min", "60 min", "90 min", "120 min"]}
                  placeholder="Selecciona duración"
                  label="Duración"
                />
              )}
            />

            <Input
              label="Precio ($)"
              variant="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              error={errors.price?.message}
              {...register('price', {
                required: 'El precio es requerido',
                validate: (value) => {
                  const sanitized = sanitizeDecimalValue(value);
                  if (!sanitized || Number.isNaN(Number(sanitized))) {
                    return 'Precio inválido';
                  }
                  return true;
                },
                onChange: (e) => {
                  e.target.value = sanitizeDecimalValue(e.target.value);
                },
              })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Descripción
            </label>
            <textarea
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white resize-none"
              {...register('description')}
            />
          </div>

        </div>
      </Modal>

      <Toast
        isOpen={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
}
