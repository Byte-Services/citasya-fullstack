import { apiService } from "./api";
import {
  PaginatedResponse,
  NotificationFilters,
  CreateNotification,
  NotificationRead,
  NotificationResp,
} from "../interfaces";
import { ApiPaginatedResponse, ApiResponse } from "@/types/api";

export class NotificationService {
  async getNotifications(
    filters?: NotificationFilters
  ): Promise<PaginatedResponse<NotificationResp>> {
    const params = new URLSearchParams();
    if (filters?.userId) params.append("userId", filters.userId);
    if (filters?.type) params.append("type", filters.type);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const response = await apiService.get<ApiPaginatedResponse<NotificationResp>>(
      `/notifications?${params.toString()}`
    );

    // Transformar la respuesta para que coincida con PaginatedResponse
    return {
      success: true,
      data: {
        edges: response.response.data.edges,
        paginated: response.response.data.paginated
      },
      pagination: {
        page: filters?.page || 1,
        limit: filters?.limit || 10,
        total: response.response.data.paginated.total,
        totalPages: response.response.data.paginated.totalPages
      }
    };
  }

  async getNotificationById(id: number): Promise<NotificationResp> {
    const response = await apiService.get<ApiResponse<NotificationResp>>(`/notifications/${id}`);
    return response.response.data;
  }

  async createNotification(notificationData: CreateNotification): Promise<NotificationResp> {
    const response = await apiService.post<ApiResponse<NotificationResp>>("/notifications", notificationData);
    return response.response.data;
  }

  async updateNotification(id: number, notificationData: NotificationRead): Promise<NotificationResp> {
    const response = await apiService.patch<ApiResponse<NotificationResp>>(`/notifications/${id}`, notificationData);
    return response.response.data;
  }

  async deleteNotification(id: number): Promise<void> {
    const response = await apiService.delete<ApiResponse<void>>(`/notifications/${id}`);
    return response.response.data;
  }
}

export const notificationService = new NotificationService();
