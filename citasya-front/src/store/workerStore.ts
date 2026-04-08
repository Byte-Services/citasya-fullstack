/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Worker,
  WorkersFilters,
  CreateWorkersRequest,
  UpdateWorkersRequest,
} from '@/interfaces/workers';
import { workersService } from '@/services/workers.service';
import { createBaseStore } from './base.Store';
import { useShallow } from 'zustand/react/shallow';

const initialState = {
  items: [] as Worker[],
  currentItem: null as Worker | null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {} as WorkersFilters,
  isLoading: false,
  error: null as string | null,
  successMessage: null as string | null,
  isInitialized: false,
};

const baseStore = createBaseStore<
  Worker,
  WorkersFilters,
  CreateWorkersRequest,
  UpdateWorkersRequest,
  typeof workersService
>(workersService, initialState, {
  createSuccessMessage: 'Trabajador creado exitosamente',
  updateSuccessMessage: 'Trabajador actualizado exitosamente',
  deleteSuccessMessage: 'Trabajador eliminado exitosamente',
  fetchError: 'Error al cargar trabajadores',
  createError: 'Error al crear trabajador',
  updateError: 'Error al actualizar trabajador',
  deleteError: 'Error al eliminar trabajador',
  fetchByIdError: 'Error al cargar trabajador',
});

const workerSelector = (state: any) => ({
  workers: state.items,
  currentWorker: state.currentItem,
  pagination: state.pagination,
  filters: state.filters,
  isLoading: state.isLoading,
  error: state.error,
  successMessage: state.successMessage,
  isInitialized: state.isInitialized,
  fetchWorkers: state.fetchAll,
  fetchWorkerById: state.fetchById,
  createWorker: state.create,
  updateWorker: state.update,
  deleteWorker: state.delete,
  setCurrentWorker: state.setCurrentItem,
  setFilters: state.setFilters,
  clearError: state.clearError,
  clearSuccessMessage: state.clearSuccessMessage,
  reset: state.reset,
  getWorkersForSelect: state.getItemsForSelect,
});

export const useWorkerStore = () => baseStore(useShallow(workerSelector));
