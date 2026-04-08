import React, { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
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
  const [formData, setFormData] = useState<WorkerFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(initialValues);
      setErrors({});
    }
  }, [initialValues, isOpen]);

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name } = e.target;
    let { value } = e.target;

    if (name === 'documentId') {
      value = sanitizeNumericValue(value);
    }

    if (name === 'phone') {
      value = formatPhoneWithCodeDash(value);
    }

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

  // Eliminada la función toggleSpecialty y toda la lógica de especialidades

  const toggleDay = (day: string) => {
    setFormData((prev) => {
      const isSelected = prev.selectedDays.includes(day);
      const newDays = isSelected
        ? prev.selectedDays.filter((d) => d !== day)
        : [...prev.selectedDays, day];

      if (errors.selectedDays && newDays.length > 0) {
        setErrors((currentErrors) => ({
          ...currentErrors,
          selectedDays: '',
        }));
      }

      return {
        ...prev,
        selectedDays: newDays,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!formData.name.trim()) nextErrors.name = 'Requerido';
    if (!formData.documentId.trim()) nextErrors.documentId = 'Requerido';
    if (!formData.email.trim()) nextErrors.email = 'Requerido';
    if (formData.email.trim() && !hasAtSymbol(formData.email.trim())) {
      nextErrors.email = 'Correo invalido';
    }
    if (!formData.phone.trim()) nextErrors.phone = 'Requerido';
    if (formData.phone.trim()) {
      const phoneValidation = validatePhoneDigits(formData.phone);
      if (phoneValidation !== true) nextErrors.phone = phoneValidation;
    }
    // No validar specialties porque el backend no lo requiere
    if (formData.selectedDays.length === 0) {
      nextErrors.selectedDays = 'Selecciona al menos un día';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const sortedDays = daysOfWeek.filter((day) =>
      formData.selectedDays.includes(day),
    );
    let dayString = sortedDays.join(', ');

    if (
      sortedDays.length > 2 &&
      daysOfWeek.indexOf(sortedDays[sortedDays.length - 1]) -
        daysOfWeek.indexOf(sortedDays[0]) ===
        sortedDays.length - 1
    ) {
      dayString = `${sortedDays[0]} - ${sortedDays[sortedDays.length - 1]}`;
    }

    const schedule = `${dayString}, ${formData.startTime} - ${formData.endTime}`;

    try {
      await saveWorkerMutation.mutateAsync(formData);

      await Promise.resolve(
        onSuccess({
          name: formData.name,
          documentId: formData.documentId,
          email: formData.email,
          phone: formData.phone,
          status: formData.status,
          schedule,
          selectedDays: formData.selectedDays,
          startTime: formData.startTime,
          endTime: formData.endTime,
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
      onSubmit={handleSubmit}
      submitLabel={saveWorkerMutation.isPending ? 'Guardando...' : 'Guardar'}
      isSubmitting={saveWorkerMutation.isPending}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nombre Completo <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-rose-500' : 'border-gray-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Documento ID <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="documentId"
              value={formData.documentId}
              onChange={handleInputChange}
              inputMode="numeric"
              className={`w-full px-4 py-3 rounded-xl border ${errors.documentId ? 'border-rose-500' : 'border-gray-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-rose-500' : 'border-gray-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Teléfono <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              inputMode="numeric"
              placeholder="0412-1234567"
              className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-rose-500' : 'border-gray-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white`}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Estado
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>

        {/* Se eliminó la sección de especialidades */}

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
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${formData.selectedDays.includes(day) ? 'bg-primary text-white' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'}`}
                >
                  {day}
                </button>
              ))}
            </div>
            {errors.selectedDays && (
              <p className="mt-1 text-sm text-rose-500">{errors.selectedDays}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Hora Inicio
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Hora Fin
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
              />
            </div>
          </div>
        </div>

        {saveWorkerMutation.isError && (
          <p className="text-sm text-rose-600">
            No se pudo guardar el trabajador. Inténtalo de nuevo.
          </p>
        )}
      </div>
    </Modal>
  );
}
