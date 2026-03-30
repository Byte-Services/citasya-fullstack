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
        this.baseEndpoint = 'admin/' + baseEndpoint;
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
                edges: response as any,
                paginated: {
                    total: 0,
                    cursor: '',
                    hasMore: false,
                    totalPages: 0,
                    totalPerPage: 0
                }
            },
            pagination: {
                page: filters?.page || 1,
                limit: filters?.limit || 10,
                total: 0,
                totalPages: 0
            }
        };
    }
    async getById(id: number): Promise<T> {
        const response = await this.service.get<ApiResponse<T>>(`/${this.baseEndpoint}/${id}`);
        return response.response.data;
    }
    async create(data: T): Promise<T> {
        const response = await this.service.post<ApiResponse<T>>(`/${this.baseEndpoint}`, data);
        return response.response.data;
    }
    async update(id: number, data: Partial<T>): Promise<T> {
        const response = await this.service.put<ApiResponse<T>>(`/${this.baseEndpoint}/${id}`, data);
        return response.response.data;
    }
    async delete(id: number): Promise<void> {
        await this.service.delete<ApiResponse<void>>(`/${this.baseEndpoint}/${id}`);
    }
}