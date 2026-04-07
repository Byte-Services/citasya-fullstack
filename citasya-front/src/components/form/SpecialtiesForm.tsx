import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { XIcon } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useSpecialtyStore } from '@/store/specialtyStore';
import { Specialty } from '@/interfaces/specialty';

interface SpecialtiesFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategories: string[];
  usedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  centerId?: string;
}

export default function SpecialtiesForm({
  isOpen,
  onClose,
  initialCategories,
  usedCategories,
  onCategoriesChange,
  centerId = '1',
}: SpecialtiesFormProps) {
  const [newSpecialty, setNewSpecialty] = useState('');
  const queryClient = useQueryClient();
  const { specialties, fetchSpecialties, createSpecialty, deleteSpecialty } =
    useSpecialtyStore();
  const typedSpecialties = specialties as Specialty[];

  useQuery({
    queryKey: ['specialties'],
    enabled: isOpen,
    queryFn: async () => {
      await fetchSpecialties({ page: 1, limit: 100 });
      return true;
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    if (typedSpecialties.length > 0) {
      onCategoriesChange(typedSpecialties.map((specialty: Specialty) => specialty.name));
      return;
    }

    onCategoriesChange(initialCategories);
  }, [isOpen, typedSpecialties, initialCategories, onCategoriesChange]);

  const createSpecialtyMutation = useMutation({
    mutationFn: async (name: string) => {
      await createSpecialty({
        name,
        description: name,
        center_id: centerId,
      });
    },
    onSuccess: async () => {
      setNewSpecialty('');
      await queryClient.invalidateQueries({ queryKey: ['specialties'] });
      await fetchSpecialties({ page: 1, limit: 100 });
    },
  });

  const deleteSpecialtyMutation = useMutation({
    mutationFn: async (id: number) => {
      await deleteSpecialty(id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['specialties'] });
      await fetchSpecialties({ page: 1, limit: 100 });
    },
  });

  const handleAddSpecialty = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedValue = newSpecialty.trim();
    if (!trimmedValue) return;

    const exists = typedSpecialties.some(
      (specialty: Specialty) => specialty.name.toLowerCase() === trimmedValue.toLowerCase(),
    );

    if (exists) {
      return;
    }

    createSpecialtyMutation.mutate(trimmedValue);
  };

  const handleRemoveSpecialty = (id: number, name: string) => {
    if (usedCategories.includes(name)) {
      alert('No puedes eliminar una categoría que tiene servicios asignados.');
      return;
    }

    deleteSpecialtyMutation.mutate(id);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestionar Especialidades"
    >
      <div className="space-y-6">
        <form onSubmit={handleAddSpecialty} className="flex gap-2">
          <input
            type="text"
            value={newSpecialty}
            onChange={(e) => setNewSpecialty(e.target.value)}
            placeholder="Nueva especialidad..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
          <button
            type="submit"
            disabled={!newSpecialty.trim() || createSpecialtyMutation.isPending}
            className="bg-primary text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {createSpecialtyMutation.isPending ? 'Agregando...' : 'Agregar'}
          </button>
        </form>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-700 mb-3">
            Especialidades Actuales
          </h3>
          {typedSpecialties.map((specialty: Specialty) => (
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
          {typedSpecialties.length === 0 && (
            <p className="text-sm text-slate-500">No hay especialidades registradas.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
