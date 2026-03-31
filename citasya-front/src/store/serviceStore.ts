/* eslint-disable @typescript-eslint/no-explicit-any */
import { Service, ServiceFilters, CreateServiceRequest, UpdateServiceRequest } from "@/interfaces/service";
import { serviceService } from "@/services/services.service";
import { createBaseStore } from "./base.Store";
import { useShallow } from "zustand/react/shallow";

const initialState = {
  items: [] as Service[],
  currentItem: null as Service | null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {} as ServiceFilters,
  isLoading: false,
  error: null as string | null,
  successMessage: null as string | null,
  isInitialized: false,
};

const baseStore = createBaseStore<
  Service,
  ServiceFilters,
  CreateServiceRequest,
  UpdateServiceRequest,
  typeof serviceService
>(
  serviceService,
  initialState,
  {
    createSuccessMessage: "Servicio creado exitosamente",
    updateSuccessMessage: "Servicio actualizado exitosamente",
    deleteSuccessMessage: "Servicio eliminado exitosamente",
    fetchError: "Error al cargar servicios",
    createError: "Error al crear servicio",
    updateError: "Error al actualizar servicio",
    deleteError: "Error al eliminar servicio",
    fetchByIdError: "Error al cargar servicio",
  }
);

const serviceSelector = (state: any) => ({
  services: state.items,
  currentService: state.currentItem,
  pagination: state.pagination,
  filters: state.filters,
  isLoading: state.isLoading,
  error: state.error,
  successMessage: state.successMessage,
  isInitialized: state.isInitialized,
  fetchServices: state.fetchAll,
  fetchServiceById: state.fetchById,
  createService: state.create,
  updateService: state.update,
  deleteService: state.delete,
  setCurrentService: state.setCurrentItem,
  setFilters: state.setFilters,
  clearError: state.clearError,
  clearSuccessMessage: state.clearSuccessMessage,
  reset: state.reset,
  getServicesForSelect: state.getItemsForSelect,
});

export const useServiceStore = () => baseStore(useShallow(serviceSelector));
