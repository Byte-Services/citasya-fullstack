import { create } from "zustand";
import {
  PaginatedResponse,
  NotificationFilters,
  CreateNotification,
  NotificationRead,
  NotificationResp,
} from "../interfaces";
import { notificationService } from "@/services/notificationService";

interface NotificationState {
  notifications: NotificationResp[];
  currentNotification: NotificationResp | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: NotificationFilters;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  // polling / realtime helpers
  isPolling?: boolean;
  hasNewNotifications?: boolean;
  lastFetchCount?: number;
}

interface NotificationStore extends NotificationState {
  // Actions
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  fetchNotificationById: (id: string) => Promise<void>;
  setCurrentNotification: (notification: NotificationResp | null) => void;
  createNotification: (notificationData: CreateNotification) => Promise<void>;
  updateNotification: (
    id: string,
    notificationData: NotificationRead
  ) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  setFilters: (filters: NotificationFilters) => void;
  clearError: () => void;
  clearSuccessMessage: () => void;
  reset: () => void;
  startAutoRefresh: (ms?: number) => void;
  stopAutoRefresh: () => void;
  clearHasNew: () => void;
}

const initialState: NotificationState = {
  notifications: [],
  currentNotification: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {},
  isLoading: false,
  error: null,
  successMessage: null,
  isPolling: false,
  hasNewNotifications: false,
  lastFetchCount: 0,
};

let __notificationRefreshTimer: ReturnType<typeof setInterval> | null = null;

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  ...initialState,

  setCurrentNotification: (notification: NotificationResp | null) => set({ currentNotification: notification }),

  fetchNotifications: async (filters?: NotificationFilters) => {
    try {
      set({ isLoading: true, error: null });

      const currentFilters = filters || get().filters;
      const response: PaginatedResponse<NotificationResp> =
        await notificationService.getNotifications(currentFilters);

      const notifications = response.data?.edges;
      const paginated = response.data?.paginated;

      // determine if there are new notifications compared to last fetch
      const prevCount = get().lastFetchCount || 0;
      const newCount = (notifications || []).length;

      set({
        notifications,
        pagination: {
          page: currentFilters.page || 1,
          limit: currentFilters.limit || 10,
          total: paginated?.total || 0,
          totalPages: paginated?.totalPages || 0,
        },
        filters: currentFilters,
        isLoading: false,
        lastFetchCount: newCount,
        // if we previously had at least one fetch and now count increased, mark as new
        hasNewNotifications: prevCount > 0 && newCount > prevCount ? true : get().hasNewNotifications,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Error al cargar notificaciones",
        isLoading: false,
      });
      throw error;
    }
  },

  fetchNotificationById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });

      const notification = await notificationService.getNotificationById(id);

      set({
        currentNotification: notification,
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Error al cargar notificación",
        isLoading: false,
      });
      throw error;
    }
  },

  createNotification: async (notificationData: CreateNotification) => {
    try {
      set({ isLoading: true, error: null, successMessage: null });

      const newNotification = await notificationService.createNotification(notificationData);

      // After creating a notification, refresh the list from the server so data is canonical
      try {
        // Use current filters when re-fetching
        const currentFilters = get().filters || undefined;
        await get().fetchNotifications(currentFilters);
      } catch {
        // If refresh fails, still add the created notification locally as a fallback
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }));
      }

      set({ isLoading: false, successMessage: 'Notificación creada exitosamente' });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Error al crear notificación",
        isLoading: false,
        successMessage: null,
      });
      throw error;
    }
  },

  updateNotification: async (id: string, notificationData: NotificationRead) => {
    try {
      set({ isLoading: true, error: null, successMessage: null });

      const updatedNotification = await notificationService.updateNotification(
        id,
        notificationData
      );

      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification.id === id ? updatedNotification : notification
        ),
        currentNotification:
          state.currentNotification?.id === id
            ? updatedNotification
            : state.currentNotification,
        isLoading: false,
        successMessage: "Notificación actualizada exitosamente",
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Error al actualizar notificación",
        isLoading: false,
        successMessage: null,
      });
      throw error;
    }
  },

  deleteNotification: async (id: string) => {
    try {
      set({ isLoading: true, error: null });

      await notificationService.deleteNotification(id);

      set((state) => ({
        notifications: state.notifications.filter((notification) => notification.id !== id),
        currentNotification:
          state.currentNotification?.id === id ? null : state.currentNotification,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Error al eliminar vehículo",
        isLoading: false,
      });
      throw error;
    }
  },
  setFilters: (filters: NotificationFilters) => {
    set({ filters });
  },

  startAutoRefresh: (ms = 30000) => {
    // clear any existing timer
    try {
      if (__notificationRefreshTimer) {
        clearInterval(__notificationRefreshTimer as unknown as number);
        __notificationRefreshTimer = null;
      }

      // start new interval
      __notificationRefreshTimer = setInterval(async () => {
        try {
          // fetch with current filters; ignore errors
          await get().fetchNotifications(get().filters || undefined);
        } catch {
          // swallow
        }
      }, ms);

      set({ isPolling: true });
    } catch {
      // ignore
    }
  },

  stopAutoRefresh: () => {
    try {
      if (__notificationRefreshTimer) {
        clearInterval(__notificationRefreshTimer as unknown as number);
        __notificationRefreshTimer = null;
      }
      set({ isPolling: false });
    } catch {
      // ignore
    }
  },

  clearHasNew: () => set({ hasNewNotifications: false }),

  clearError: () => {
    set({ error: null });
  },

  clearSuccessMessage: () => {
    set({ successMessage: null });
  },

  reset: () => {
    set(initialState);
  },
}));
