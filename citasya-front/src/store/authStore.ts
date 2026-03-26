import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState, LoginRequest, LoginResponse, RefreshTokenResponse } from '../interfaces';
import { useNotificationStore } from './notificationStore';
import { authService } from '@/services/authService';

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshAuthToken: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true });
          
          // Llamada a la API real
          const data: LoginResponse = await authService.login(credentials);

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Trigger notifications load and start polling (if available)
          try {
            const ns = useNotificationStore.getState();
            const fetchNotifications = ns.fetchNotifications;
            const startAutoRefresh = ns.startAutoRefresh;
            if (typeof fetchNotifications === 'function') {
              fetchNotifications({ userId: data.user.id }).catch(() => {});
            }
            if (typeof startAutoRefresh === 'function') {
              try { startAutoRefresh(30000); } catch { /* ignore */ }
            }
          } catch (_err) {
            // don't block login if notifications fail
            console.log('No se pudo inicializar notificaciones:', _err);
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          const { token } = get();
          
          if (token) {
            await authService.logout();
          }
        } catch (error) {
          console.error('Error en logout:', error);
        } finally {
          // stop notification polling if running
          try {
            const ns = useNotificationStore.getState();
            const stopAutoRefresh = ns.stopAutoRefresh;
            if (typeof stopAutoRefresh === 'function') stopAutoRefresh();
          } catch {
            /* ignore */
          }

          set(initialState);
        }
      },

      refreshAuthToken: async () => {
        try {
          const { token } = get();
          
          if (!token) {
            throw new Error('No hay token');
          }

          const data: RefreshTokenResponse = await authService.refreshToken(token);

          set({
            token: data.token,
          });
        } catch (error) {
          set(initialState);
          throw error;
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      clearAuth: () => {
        set(initialState);
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      // When persisted auth is rehydrated (page reload), trigger notifications
      onRehydrateStorage: () => (persistedState) => {
        try {
          if (persistedState && typeof persistedState === 'object' && 'user' in persistedState) {
            const p = persistedState as unknown as { user?: { id?: string }; token?: string };
            const user = p.user;
            if (user && user.id) {
              const ns = useNotificationStore.getState();
              const fetchNotifications = ns.fetchNotifications;
              const startAutoRefresh = ns.startAutoRefresh;
              if (typeof fetchNotifications === 'function') {
                fetchNotifications({ userId: user.id }).catch(() => {});
              }
              if (typeof startAutoRefresh === 'function') {
                try { startAutoRefresh(30000); } catch { /* ignore */ }
              }
            }
          }
        } catch (_err) {
          console.warn('Error al rehidratar notificaciones:', _err);
        }
      },
    }
  )
); 