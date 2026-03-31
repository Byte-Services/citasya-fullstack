/* eslint-disable @typescript-eslint/no-explicit-any */
import { Specialty, SpecialtyFilters, CreateSpecialtyRequest, UpdateSpecialtyRequest } from "@/interfaces/specialty";
import { specialtyService } from "@/services/specialties.service";
import { createBaseStore } from "./base.Store";
import { useShallow } from "zustand/react/shallow";

const initialState = {
  items: [] as Specialty[],
  currentItem: null as Specialty | null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {} as SpecialtyFilters,
  isLoading: false,
  error: null as string | null,
  successMessage: null as string | null,
  isInitialized: false,
};

const baseStore = createBaseStore<
  Specialty,
  SpecialtyFilters,
  CreateSpecialtyRequest,
  UpdateSpecialtyRequest,
  typeof specialtyService
>(
  specialtyService,
  initialState,
  {
    createSuccessMessage: "Especialidad creada exitosamente",
    updateSuccessMessage: "Especialidad actualizada exitosamente",
    deleteSuccessMessage: "Especialidad eliminada exitosamente",
    fetchError: "Error al cargar especialidades",
    createError: "Error al crear especialidad",
    updateError: "Error al actualizar especialidad",
    deleteError: "Error al eliminar especialidad",
    fetchByIdError: "Error al cargar especialidad",
  }
);

const specialtySelector = (state: any) => ({
  specialties: state.items,
  currentSpecialty: state.currentItem,
  pagination: state.pagination,
  filters: state.filters,
  isLoading: state.isLoading,
  error: state.error,
  successMessage: state.successMessage,
  isInitialized: state.isInitialized,
  fetchSpecialties: state.fetchAll,
  fetchSpecialtyById: state.fetchById,
  createSpecialty: state.create,
  updateSpecialty: state.update,
  deleteSpecialty: state.delete,
  setCurrentSpecialty: state.setCurrentItem,
  setFilters: state.setFilters,
  clearError: state.clearError,
  clearSuccessMessage: state.clearSuccessMessage,
  reset: state.reset,
  getSpecialtiesForSelect: state.getItemsForSelect,
});

export const useSpecialtyStore = () => baseStore(useShallow(specialtySelector));
