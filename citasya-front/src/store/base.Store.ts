/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { BaseEntity } from "@/interfaces/common";
import { BaseFilters, BaseService } from "@/services/baseService";

export interface BaseStoreState<T extends BaseEntity, TFilters extends BaseFilters> {
  items: T[];
  currentItem: T | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: TFilters;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  isInitialized: boolean;
}

export interface BaseStoreActions<T extends BaseEntity, TFilters extends BaseFilters, TCreate, TUpdate> {
  fetchAll: (filters?: TFilters) => Promise<void>;
  fetchById: (id: number) => Promise<void>;
  create: (data: TCreate) => Promise<void>;
  update: (id: number, data: TUpdate) => Promise<void>;
  delete: (id: number) => Promise<void>;
  setCurrentItem: (item: T | null) => void;
  setFilters: (filters: TFilters) => void;
  clearError: () => void;
  clearSuccessMessage: () => void;
  reset: () => void;
  getItemsForSelect: (labelField: keyof T, secondaryField?: keyof T) => { label: string; value: string }[];
}

export type BaseStore<T extends BaseEntity, TFilters extends BaseFilters, TCreate, TUpdate> = 
  BaseStoreState<T, TFilters> & BaseStoreActions<T, TFilters, TCreate, TUpdate>;

export function createBaseStore<
  T extends BaseEntity,
  TFilters extends BaseFilters,
  TCreate,
  TUpdate extends Partial<T>,
  TService extends BaseService<T>
>(
  service: TService,
  initialState: BaseStoreState<T, TFilters>,
  config?: {
    createSuccessMessage?: string;
    updateSuccessMessage?: string;
    deleteSuccessMessage?: string;
    fetchError?: string;
    createError?: string;
    updateError?: string;
    deleteError?: string;
    fetchByIdError?: string;
  }
) {
  const defaultConfig = {
    createSuccessMessage: "Creado exitosamente",
    updateSuccessMessage: "Actualizado exitosamente",
    deleteSuccessMessage: "Eliminado exitosamente",
    fetchError: "Error al cargar",
    createError: "Error al crear",
    updateError: "Error al actualizar",
    deleteError: "Error al eliminar",
    fetchByIdError: "Error al cargar",
    ...config,
  };

  return create<BaseStore<T, TFilters, TCreate, TUpdate>>((set, get) => ({
    ...initialState,

    fetchAll: async (filters?: TFilters) => {
      try {
        set({ isLoading: true, error: null });

        const currentFilters = filters || get().filters;
        const response = await service.getAll(currentFilters as any);

        set({
          items: response.data?.edges || [],
          pagination: {
            page: response.pagination?.page || (currentFilters.page || 1),
            limit: response.pagination?.limit || (currentFilters.limit || 10),
            total: response.pagination?.total || 0,
            totalPages: response.pagination?.totalPages || 0,
          },
          filters: currentFilters,
          isLoading: false,
          isInitialized: true,
        });
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : defaultConfig.fetchError,
          isLoading: false,
        });
        throw error;
      }
    },

    fetchById: async (id: number) => {
      try {
        set({ isLoading: true, error: null });

        const item = await service.getById(id);

        set({
          currentItem: item,
          isLoading: false,
        });
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : defaultConfig.fetchByIdError,
          isLoading: false,
        });
        throw error;
      }
    },

    create: async (data: TCreate) => {
      try {
        set({ isLoading: true, error: null, successMessage: null });

        const newItem = await service.create(data as any);

        set((state) => ({
          items: [newItem, ...state.items],
          isLoading: false,
          successMessage: defaultConfig.createSuccessMessage,
        }));
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : defaultConfig.createError,
          isLoading: false,
          successMessage: null,
        });
        throw error;
      }
    },

    update: async (id: number, data: TUpdate) => {
      try {
        set({ isLoading: true, error: null, successMessage: null });

        const updatedItem = await service.update(id, data as any);

        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? updatedItem : item
          ),
          currentItem:
            state.currentItem?.id === id ? updatedItem : state.currentItem,
          isLoading: false,
          successMessage: defaultConfig.updateSuccessMessage,
        }));
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : defaultConfig.updateError,
          isLoading: false,
          successMessage: null,
        });
        throw error;
      }
    },

    delete: async (id: number) => {
      try {
        set({ isLoading: true, error: null, successMessage: null });

        await service.delete(id);

        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          currentItem:
            state.currentItem?.id === id ? null : state.currentItem,
          isLoading: false,
          successMessage: defaultConfig.deleteSuccessMessage,
        }));
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : defaultConfig.deleteError,
          isLoading: false,
          successMessage: null,
        });
        throw error;
      }
    },

    setCurrentItem: (item: T | null) => {
      set({ currentItem: item });
    },

    setFilters: (filters: TFilters) => {
      set({ filters });
    },

    clearError: () => {
      set({ error: null });
    },

    clearSuccessMessage: () => {
      set({ successMessage: null });
    },

    reset: () => {
      set(initialState);
    },

    getItemsForSelect: (labelField: keyof T, secondaryField?: keyof T) => {
      const { items } = get();
      return items.map((item) => ({
        label: String(item[labelField]),
        value: secondaryField ? `${item[secondaryField]}` : String(item.id),
      }));
    },
  }));
}

