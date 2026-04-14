import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { XIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Input from '@/components/common/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import Toast from '@/components/ui/Toast';
import { useSpecialtyStore } from '@/store/specialtyStore';
import { Specialty } from '@/interfaces/specialty';

type SpecialtyFormValues = {
  specialtyName: string;
};

interface SpecialtiesFormProps {
  isOpen: boolean;
  onClose: () => void;
  usedCategories: string[];
  centerId?: string;
}

export default function SpecialtiesForm({
  isOpen,
  onClose,
  usedCategories,
  centerId = '1',
}: SpecialtiesFormProps) {
  const [pendingDelete, setPendingDelete] = useState<{ id: number; name: string } | null>(null);
  const [toast, setToast] = useState<{
    open: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    open: false,
    type: 'success',
    message: '',
  });
  const queryClient = useQueryClient();
  const { specialties, fetchSpecialties, createSpecialty, deleteSpecialty } =
    useSpecialtyStore();
  const typedSpecialties = specialties as Specialty[];
  const normalizedUsedCategories = useMemo(
    () => new Set(usedCategories.map((item) => item.trim().toLowerCase())),
    [usedCategories],
  );

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<SpecialtyFormValues>({
    defaultValues: {
      specialtyName: '',
    },
  });

  const uniqueSpecialties = useMemo(() => {
    const registry = new Map<string, Specialty>();

    typedSpecialties.forEach((specialty) => {
      const key = specialty.name.trim().toLowerCase();
      if (!registry.has(key)) {
        registry.set(key, specialty);
      }
    });

    return Array.from(registry.values());
  }, [typedSpecialties]);

  useQuery({
    queryKey: ['specialties'],
    enabled: isOpen,
    queryFn: async () => {
      await fetchSpecialties({ page: 1, limit: 100 });
      return true;
    },
  });

  const createSpecialtyMutation = useMutation({
    mutationFn: async (name: string) => {
      await createSpecialty({
        name,
        description: name,
        center_id: centerId,
      });
    },
    onSuccess: async () => {
      reset({ specialtyName: '' });
      clearErrors();
      setToast({
        open: true,
        type: 'success',
        message: 'Especialidad agregada correctamente.',
      });
      try {
        await queryClient.invalidateQueries({ queryKey: ['specialties'] });
        await fetchSpecialties({ page: 1, limit: 100 });
      } catch {
        // local store is already updated by createSpecialty
      }
    },
    onError: () => {
      setToast({
        open: true,
        type: 'error',
        message: 'No se pudo agregar la especialidad.',
      });
    },
  });

  const deleteSpecialtyMutation = useMutation({
    mutationFn: async (id: number) => {
      await deleteSpecialty(id);
    },
    onSuccess: async () => {
      setToast({
        open: true,
        type: 'success',
        message: 'Especialidad eliminada correctamente.',
      });
      try {
        await queryClient.invalidateQueries({ queryKey: ['specialties'] });
        await fetchSpecialties({ page: 1, limit: 100 });
      } catch {
        // local store is already updated by deleteSpecialty
      }
    },
    onError: () => {
      setToast({
        open: true,
        type: 'error',
        message: 'No se pudo eliminar la especialidad.',
      });
    },
  });

  const handleAddSpecialty = async (values: SpecialtyFormValues) => {
    const trimmedValue = values.specialtyName.trim();

    const exists = uniqueSpecialties.some(
      (specialty: Specialty) => specialty.name.toLowerCase() === trimmedValue.toLowerCase(),
    );

    if (exists) {
      setToast({
        open: true,
        type: 'error',
        message: 'Esa especialidad ya existe.',
      });
      return;
    }

    createSpecialtyMutation.mutate(trimmedValue);
  };

  const handleRemoveSpecialty = (id: number, name: string) => {
    const normalizedName = name.trim().toLowerCase();

    if (normalizedUsedCategories.has(normalizedName)) {
      setToast({
        open: true,
        type: 'error',
        message: 'No puedes eliminar una especialidad que tiene servicios asignados.',
      });
      return;
    }

    setPendingDelete({ id, name });
  };

  const confirmDeleteSpecialty = () => {
    if (!pendingDelete) return;
    deleteSpecialtyMutation.mutate(pendingDelete.id);
    setPendingDelete(null);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Gestionar Especialidades"
      >
        <div className="space-y-6">
          <form
            onSubmit={handleSubmit(handleAddSpecialty)}
            noValidate
            className="space-y-3"
          >
            <Input
              label="Nueva especialidad"
              placeholder="Nueva especialidad..."
              error={errors.specialtyName?.message}
              containerClassName="space-y-1"
              {...register('specialtyName', {
                required: 'La especialidad es requerida',
                validate: (value) =>
                  value.trim().length > 0 || 'La especialidad es requerida',
              })}
            />
            <button
              type="submit"
              disabled={createSpecialtyMutation.isPending}
              className="bg-primary text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {createSpecialtyMutation.isPending ? 'Agregando...' : 'Agregar'}
            </button>
          </form>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-700 mb-3">
              Especialidades Actuales
            </h3>
            {uniqueSpecialties.map((specialty: Specialty) => (
              <div
                key={specialty.id}
                className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-100"
              >
                <span className="font-medium text-slate-700">{specialty.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSpecialty(specialty.id, specialty.name)}
                  className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                  title="Eliminar especialidad"
                  disabled={deleteSpecialtyMutation.isPending}
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
            {uniqueSpecialties.length === 0 && (
              <p className="text-sm text-slate-500">No hay especialidades registradas.</p>
            )}

          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDeleteSpecialty}
        title="¿Eliminar especialidad?"
        message={`Se eliminara la especialidad ${pendingDelete?.name || ''}. Esta accion no se puede deshacer.`}
        confirmLabel="Eliminar"
        confirmVariant="danger"
      />

      <Toast
        isOpen={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
}
