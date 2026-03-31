/* eslint-disable @typescript-eslint/no-explicit-any */
import { User, UserFilters, CreateUserRequest, UpdateUserRequest } from "@/interfaces/userEntity";
import { userService } from "@/services/users.service";
import { createBaseStore } from "./base.Store";
import { useShallow } from "zustand/react/shallow";

const initialState = {
  items: [] as User[],
  currentItem: null as User | null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {} as UserFilters,
  isLoading: false,
  error: null as string | null,
  successMessage: null as string | null,
  isInitialized: false,
};

const baseStore = createBaseStore<
  User,
  UserFilters,
  CreateUserRequest,
  UpdateUserRequest,
  typeof userService
>(
  userService,
  initialState,
  {
    createSuccessMessage: "Usuario creado exitosamente",
    updateSuccessMessage: "Usuario actualizado exitosamente",
    deleteSuccessMessage: "Usuario eliminado exitosamente",
    fetchError: "Error al cargar usuarios",
    createError: "Error al crear usuario",
    updateError: "Error al actualizar usuario",
    deleteError: "Error al eliminar usuario",
    fetchByIdError: "Error al cargar usuario",
  }
);

const userSelector = (state: any) => ({
  users: state.items,
  currentUser: state.currentItem,
  pagination: state.pagination,
  filters: state.filters,
  isLoading: state.isLoading,
  error: state.error,
  successMessage: state.successMessage,
  isInitialized: state.isInitialized,
  fetchUsers: state.fetchAll,
  fetchUserById: state.fetchById,
  createUser: state.create,
  updateUser: state.update,
  deleteUser: state.delete,
  setCurrentUser: state.setCurrentItem,
  setFilters: state.setFilters,
  clearError: state.clearError,
  clearSuccessMessage: state.clearSuccessMessage,
  reset: state.reset,
  getUsersForSelect: state.getItemsForSelect,
});

export const useUserStore = () => baseStore(useShallow(userSelector));
