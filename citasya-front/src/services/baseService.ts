import { PaginatedResponse } from "@/interfaces";
import { apiService } from "./api";
import { ApiPaginatedResponse, ApiResponse } from "@/types/api";
export interface BaseFilters {
    page?: number;
    limit?: number;
}
export class BaseService<T> {
    public service = apiService;
    public baseEndpoint: string;
    constructor(baseEndpoint: string) {
        this.baseEndpoint = baseEndpoint;
    }
    async getAll(filters?: BaseFilters & Record<string, string>): Promise<PaginatedResponse<T>> {
        const params = new URLSearchParams();
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());
        Object.entries(filters || {}).forEach(([key, value]) => {
            params.append(key, value.toString());
        });
        const response = await this.service.get<ApiPaginatedResponse<T>>(`/${this.baseEndpoint}?${params.toString()}`);
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
    async getById(id: string): Promise<T> {
        const response = await this.service.get<ApiResponse<T>>(`/${this.baseEndpoint}/${id}`);
        return response.response.data;
    }
    async create(data: T): Promise<T> {
        const response = await this.service.post<ApiResponse<T>>(`/${this.baseEndpoint}`, data);
        return response.response.data;
    }
    async update(id: string, data: Partial<T>): Promise<T> {
        const response = await this.service.put<ApiResponse<T>>(`/${this.baseEndpoint}/${id}`, data);
        return response.response.data;
    }
    async delete(id: string): Promise<void> {
        await this.service.delete<ApiResponse<void>>(`/${this.baseEndpoint}/${id}`);
    }
}