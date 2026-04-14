/* eslint-disable @typescript-eslint/no-explicit-any */
import { DashboardMetrics, Report, ReportFilters, CreateReportRequest, UpdateReportRequest } from "@/interfaces/report";
import { reportService } from "@/services/reports.service";
import { createBaseStore } from "./base.Store";
import { useShallow } from "zustand/react/shallow";
import { create } from "zustand";

const initialState = {
  items: [] as Report[],
  currentItem: null as Report | null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {} as ReportFilters,
  isLoading: false,
  error: null as string | null,
  successMessage: null as string | null,
  isInitialized: false,
};

const baseStore = createBaseStore<
  Report,
  ReportFilters,
  CreateReportRequest,
  UpdateReportRequest,
  typeof reportService
>(
  reportService,
  initialState,
  {
    createSuccessMessage: "Reporte creado exitosamente",
    updateSuccessMessage: "Reporte actualizado exitosamente",
    deleteSuccessMessage: "Reporte eliminado exitosamente",
    fetchError: "Error al cargar reportes",
    createError: "Error al crear reporte",
    updateError: "Error al actualizar reporte",
    deleteError: "Error al eliminar reporte",
    fetchByIdError: "Error al cargar reporte",
  }
);


const reportSelector = (state: any) => ({
  reports: state.items,
  currentReport: state.currentItem,
  pagination: state.pagination,
  filters: state.filters,
  isLoading: state.isLoading,
  error: state.error,
  successMessage: state.successMessage,
  isInitialized: state.isInitialized,
  fetchReports: state.fetchAll,
  fetchReportById: state.fetchById,
  createReport: state.create,
  updateReport: state.update,
  deleteReport: state.delete,
  setCurrentReport: state.setCurrentItem,
  setFilters: state.setFilters,
  clearError: state.clearError,
  clearSuccessMessage: state.clearSuccessMessage,
  reset: state.reset,
  getReportsForSelect: state.getItemsForSelect,
});

export const useReportStore = () => baseStore(useShallow(reportSelector));

interface ReportDashboardStore {
  metrics: DashboardMetrics | null;
  isLoading: boolean;
  error: string | null;
  fetchDashboardMetrics: () => Promise<void>;
  clearError: () => void;
}

export const useReportDashboardStore = create<ReportDashboardStore>((set) => ({
  metrics: null,
  isLoading: false,
  error: null,
  fetchDashboardMetrics: async () => {
    try {
      set({ isLoading: true, error: null });
      const metrics = await reportService.getDashboardMetrics();
      set({ metrics, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Error al cargar metricas del dashboard",
        isLoading: false,
      });
    }
  },
  clearError: () => set({ error: null }),
}));
