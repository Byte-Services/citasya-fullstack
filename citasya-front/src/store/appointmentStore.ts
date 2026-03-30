import { Appointment, AppointmentFilters, CreateAppointmentRequest, UpdateAppointmentRequest } from "@/interfaces/appointment";
import { appointmentService } from "@/services/appointments.service";
import { createBaseStore } from "./base.Store";
import { useShallow } from "zustand/react/shallow";

const initialState = {
  items: [] as Appointment[],
  currentItem: null as Appointment | null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {} as AppointmentFilters,
  isLoading: false,
  error: null as string | null,
  successMessage: null as string | null,
  isInitialized: false,
};

// Create the base store
const baseStore = createBaseStore<
  Appointment,
  AppointmentFilters,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  typeof appointmentService
>(
  appointmentService,
  initialState,
  {
    createSuccessMessage: "Cita creada exitosamente",
    updateSuccessMessage: "Cita actualizada exitosamente",
    deleteSuccessMessage: "Cita eliminada exitosamente",
    fetchError: "Error al cargar citas",
    createError: "Error al crear cita",
    updateError: "Error al actualizar cita",
    deleteError: "Error al eliminar cita",
    fetchByIdError: "Error al cargar cita",
  }
);

// Stable selector outside to prevent recreation on every render
const appointmentSelector = (state: any) => ({
  appointments: state.items,
  currentAppointment: state.currentItem,
  pagination: state.pagination,
  filters: state.filters,
  isLoading: state.isLoading,
  error: state.error,
  successMessage: state.successMessage,
  isInitialized: state.isInitialized,
  fetchAppointments: state.fetchAll,
  fetchAppointmentById: state.fetchById,
  createAppointment: state.create,
  updateAppointment: state.update,
  deleteAppointment: state.delete,
  setCurrentAppointment: state.setCurrentItem,
  setFilters: state.setFilters,
  clearError: state.clearError,
  clearSuccessMessage: state.clearSuccessMessage,
  reset: state.reset,
  getAppointmentsForSelect: state.getItemsForSelect,
});

// useShallow wraps the selector so Zustand uses shallow comparison instead of Object.is
// This prevents infinite re-renders when the selector returns a new object reference
export const useAppointmentStore = () => baseStore(useShallow(appointmentSelector));