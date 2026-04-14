import React, { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import Input from '@/components/common/Input';
import Dropdown from '@/components/common/Dropdown';
import { Modal } from '@/components/ui/Modal';
import { useWorkerStore } from '@/store/workerStore';
import {
  CreateWorkersRequest,
  UpdateWorkersRequest,
} from '@/interfaces/workers';
import {
  formatPhoneWithCodeDash,
  hasAtSymbol,
  sanitizeNumericValue,
  validatePhoneDigits,
} from '@/utils/formValidation';

export interface WorkerFormValues {
  name: string;
  documentId: string;
  email: string;
  phone: string;
  status: string;
  selectedDays: string[];
  startTime: string;
  endTime: string;
}

export interface WorkerFormSubmitData {
  name: string;
  documentId: string;
  email: string;
  phone: string;
  status: string;
  schedule: string;
  selectedDays: string[];
  startTime: string;
  endTime: string;
}

type WorkerFormNotification = {
  type: 'success' | 'error';
  message: string;
};

interface WorkerFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingWorkerId: number | null;
  initialValues: WorkerFormValues;
  daysOfWeek: string[];
  onSuccess: (payload: WorkerFormSubmitData) => void | Promise<void>;
  onNotify?: (notification: WorkerFormNotification) => void;
}

export default function WorkerForm({
  isOpen,
  onClose,
  editingWorkerId,
  initialValues,
  daysOfWeek,
  onSuccess,
  onNotify,
}: WorkerFormProps) {
  const { createWorker, updateWorker } = useWorkerStore();

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<WorkerFormValues>({
    defaultValues: initialValues,
  });

  const selectedDays = watch('selectedDays');

  useEffect(() => {
    if (isOpen) {
      reset(initialValues);
      clearErrors();
    }
  }, [initialValues, isOpen, reset, clearErrors]);

  const saveWorkerMutation = useMutation({
    mutationFn: async (values: WorkerFormValues) => {
      const schedule = {
        days: values.selectedDays,
        startTime: values.startTime,
        endTime: values.endTime,
      };

      const basePayload: UpdateWorkersRequest = {
        name: values.name,
        documentId: values.documentId || null,
        email: values.email,
        phone: values.phone,
        status: values.status,
        center_id: 1,
        schedule,
      };

      if (editingWorkerId) {
        await updateWorker(editingWorkerId, basePayload);
      } else {
        const createPayload: CreateWorkersRequest = {
          name: basePayload.name || '',
          documentId: basePayload.documentId || null,
          email: basePayload.email || '',
          phone: basePayload.phone || null,
          status: basePayload.status || 'Activo',
          center_id: 1,
          schedule,
        };
        await createWorker(createPayload);
      }
    },
  });

  const toggleDay = (day: string) => {
    const isSelected = selectedDays.includes(day);
    const nextDays = isSelected
      ? selectedDays.filter((selectedDay) => selectedDay !== day)
      : [...selectedDays, day];

    setValue('selectedDays', nextDays, { shouldValidate: true });
  };

  const handleFormSubmit = async (values: WorkerFormValues) => {
    clearErrors('root');

    if (!values.selectedDays.length) {
      setError('selectedDays', {
        type: 'manual',
        message: 'Selecciona al menos un día',
      });
      return;
    }

    const email = values.email.trim();
    if (email && !hasAtSymbol(email)) {
      setError('email', {
        type: 'manual',
        message: 'Correo invalido',
      });
      return;
    }

    if (values.phone.trim()) {
      const phoneValidation = validatePhoneDigits(values.phone);
      if (phoneValidation !== true) {
        setError('phone', {
          type: 'manual',
          message: phoneValidation,
        });
        return;
      }
    }

    const normalizedDocumentId = sanitizeNumericValue(values.documentId);
    const normalizedPhone = formatPhoneWithCodeDash(values.phone);
    const sortedDays = daysOfWeek.filter((day) => values.selectedDays.includes(day));
    let dayString = sortedDays.join(', ');

    if (
      sortedDays.length > 2 &&
      daysOfWeek.indexOf(sortedDays[sortedDays.length - 1]) -
        daysOfWeek.indexOf(sortedDays[0]) ===
        sortedDays.length - 1
    ) {
      dayString = `${sortedDays[0]} - ${sortedDays[sortedDays.length - 1]}`;
    }

    const schedule = `${dayString}, ${values.startTime} - ${values.endTime}`;

    try {
      await saveWorkerMutation.mutateAsync(values);

      await Promise.resolve(
        onSuccess({
          name: values.name,
          documentId: normalizedDocumentId,
          email: values.email,
          phone: normalizedPhone,
          status: values.status,
          schedule,
          selectedDays: values.selectedDays,
          startTime: values.startTime,
          endTime: values.endTime,
        }),
      );

      onNotify?.({
        type: 'success',
        message: editingWorkerId
          ? 'Trabajador actualizado correctamente.'
          : 'Trabajador creado correctamente.',
      });

      onClose();
    } catch {
      onNotify?.({
        type: 'error',
        message: 'No se pudo guardar el trabajador.',
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingWorkerId ? 'Editar Trabajador' : 'Agregar Trabajador'}
      onSubmit={handleSubmit(handleFormSubmit)}
      submitLabel={saveWorkerMutation.isPending ? 'Guardando...' : 'Guardar'}
      noValidate
      isSubmitting={saveWorkerMutation.isPending}
    >
      <div className="space-y-4">
        <Input
          label="Nombre Completo"
          error={errors.name?.message}
          {...register('name', {
            required: 'El nombre es requerido',
            validate: (value) => value.trim().length > 0 || 'El nombre es requerido',
          })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Documento ID"
            inputMode="numeric"
            error={errors.documentId?.message}
            {...register('documentId', {
              required: 'El documento es requerido',
              validate: (value) => value.trim().length > 0 || 'El documento es requerido',
              onChange: (e) => {
                e.target.value = sanitizeNumericValue(e.target.value);
              },
            })}
          />

          <Input
            label="Email"
            variant="email"
            error={errors.email?.message}
            {...register('email', {
              required: 'El correo es requerido',
              validate: (value) => {
                const trimmed = value.trim();
                if (!trimmed) return 'El correo es requerido';
                return hasAtSymbol(trimmed) || 'Correo invalido';
              },
            })}
          />

          <Input
            label="Teléfono"
            variant="tel"
            inputMode="numeric"
            placeholder="0412-1234567"
            error={errors.phone?.message}
            {...register('phone', {
              required: 'El telefono es requerido',
              validate: (value) => {
                if (value.trim().length === 0) return 'El telefono es requerido';
                return validatePhoneDigits(value);
              },
              onChange: (e) => {
                e.target.value = formatPhoneWithCodeDash(e.target.value);
              },
            })}
          />
        </div>

        <Dropdown
          name="status"
          value={watch('status')}
          onChange={(e) => setValue('status', e.target.value, { shouldValidate: true })}
          options={['Activo', 'Inactivo']}
          label="Estado"
        />

        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-sm font-bold text-slate-800 mb-4">
            Horario de Trabajo
          </h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Días <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${selectedDays.includes(day) ? 'bg-primary text-white' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'}`}
                >
                  {day}
                </button>
              ))}
            </div>
            {errors.selectedDays ? (
              <p className="mt-1 text-sm text-rose-500">{errors.selectedDays.message}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Hora Inicio" variant="time" {...register('startTime')} />
            <Input label="Hora Fin" variant="time" {...register('endTime')} />
          </div>
        </div>

        {saveWorkerMutation.isError ? (
          <p className="text-sm text-rose-600">
            No se pudo guardar el trabajador. Inténtalo de nuevo.
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
