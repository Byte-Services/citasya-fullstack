import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState, LoginRequest, LoginResponse } from '../interfaces';
import { authService } from '@/services/auth.service';

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuthToken: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
  setHasHydrated: (value: boolean) => void;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  hasHydrated: false,
};

const clearedAuthState: AuthState = {
  ...initialState,
  hasHydrated: true,
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
          set(clearedAuthState);
        }
      },

      refreshAuthToken: async () => {
        set(clearedAuthState);
        throw new Error('Sesion expirada');
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      clearAuth: () => {
        set(clearedAuthState);
      },

      setHasHydrated: (value: boolean) => {
        set({ hasHydrated: value });
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
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
); 