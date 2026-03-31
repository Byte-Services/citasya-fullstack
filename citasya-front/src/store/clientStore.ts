/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, ClientFilters, CreateClientRequest, UpdateClientRequest } from "@/interfaces/client";
import { clientService } from "@/services/clients.service";
import { createBaseStore } from "./base.Store";
import { useShallow } from "zustand/react/shallow";

const initialState = {
  items: [] as Client[],
  currentItem: null as Client | null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {} as ClientFilters,
  isLoading: false,
  error: null as string | null,
  successMessage: null as string | null,
  isInitialized: false,
};

const baseStore = createBaseStore<
  Client,
  ClientFilters,
  CreateClientRequest,
  UpdateClientRequest,
  typeof clientService
>(
  clientService,
  initialState,
  {
    createSuccessMessage: "Cliente creado exitosamente",
    updateSuccessMessage: "Cliente actualizado exitosamente",
    deleteSuccessMessage: "Cliente eliminado exitosamente",
    fetchError: "Error al cargar clientes",
    createError: "Error al crear cliente",
    updateError: "Error al actualizar cliente",
    deleteError: "Error al eliminar cliente",
    fetchByIdError: "Error al cargar cliente",
  }
);

const clientSelector = (state: any) => ({
  clients: state.items,
  currentClient: state.currentItem,
  pagination: state.pagination,
  filters: state.filters,
  isLoading: state.isLoading,
  error: state.error,
  successMessage: state.successMessage,
  isInitialized: state.isInitialized,
  fetchClients: state.fetchAll,
  fetchClientById: state.fetchById,
  createClient: state.create,
  updateClient: state.update,
  deleteClient: state.delete,
  setCurrentClient: state.setCurrentItem,
  setFilters: state.setFilters,
  clearError: state.clearError,
  clearSuccessMessage: state.clearSuccessMessage,
  reset: state.reset,
  getClientsForSelect: state.getItemsForSelect,
});

export const useClientStore = () => baseStore(useShallow(clientSelector));
