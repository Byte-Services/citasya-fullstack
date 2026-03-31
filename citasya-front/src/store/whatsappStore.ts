/* eslint-disable @typescript-eslint/no-explicit-any */
import { WhatsAppWebhook, WhatsAppWebhookFilters, CreateWhatsAppWebhookRequest, UpdateWhatsAppWebhookRequest } from "@/interfaces/whatsapp";
import { whatsappService } from "@/services/whatsapp.service";
import { createBaseStore } from "./base.Store";
import { useShallow } from "zustand/react/shallow";

const initialState = {
  items: [] as WhatsAppWebhook[],
  currentItem: null as WhatsAppWebhook | null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {} as WhatsAppWebhookFilters,
  isLoading: false,
  error: null as string | null,
  successMessage: null as string | null,
  isInitialized: false,
};

const baseStore = createBaseStore<
  WhatsAppWebhook,
  WhatsAppWebhookFilters,
  CreateWhatsAppWebhookRequest,
  UpdateWhatsAppWebhookRequest,
  typeof whatsappService
>(
  whatsappService,
  initialState,
  {
    createSuccessMessage: "Webhook de WhatsApp creado exitosamente",
    updateSuccessMessage: "Webhook de WhatsApp actualizado exitosamente",
    deleteSuccessMessage: "Webhook de WhatsApp eliminado exitosamente",
    fetchError: "Error al cargar webhooks de WhatsApp",
    createError: "Error al crear webhook de WhatsApp",
    updateError: "Error al actualizar webhook de WhatsApp",
    deleteError: "Error al eliminar webhook de WhatsApp",
    fetchByIdError: "Error al cargar webhook de WhatsApp",
  }
);

const whatsappSelector = (state: any) => ({
  webhooks: state.items,
  currentWebhook: state.currentItem,
  pagination: state.pagination,
  filters: state.filters,
  isLoading: state.isLoading,
  error: state.error,
  successMessage: state.successMessage,
  isInitialized: state.isInitialized,
  fetchWebhooks: state.fetchAll,
  fetchWebhookById: state.fetchById,
  createWebhook: state.create,
  updateWebhook: state.update,
  deleteWebhook: state.delete,
  setCurrentWebhook: state.setCurrentItem,
  setFilters: state.setFilters,
  clearError: state.clearError,
  clearSuccessMessage: state.clearSuccessMessage,
  reset: state.reset,
  getWebhooksForSelect: state.getItemsForSelect,
});

export const useWhatsAppStore = () => baseStore(useShallow(whatsappSelector));
