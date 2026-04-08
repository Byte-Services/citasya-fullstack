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

    private getEmptyPaginatedMeta() {
        return {
            total: 0,
            cursor: '',
            hasMore: false,
            totalPages: 0,
            totalPerPage: 0,
        };
    }

    private unwrapResponse<TData>(response: unknown): TData {
        const typed = response as {
            response?: { data?: TData };
            data?: TData;
        };

        if (typed?.response?.data !== undefined) {
            return typed.response.data;
        }

        if (typed?.data !== undefined) {
            return typed.data;
        }

        return response as TData;
    }

    async getAll(filters?: BaseFilters & Record<string, string>): Promise<PaginatedResponse<T>> {
        type PaginatedMeta = {
            total: number;
            cursor?: string;
            hasMore: boolean;
            totalPages: number;
            totalPerPage: number;
        };

        type ListPayload = {
            edges?: T[];
            paginated?: PaginatedMeta;
        };

        const params = new URLSearchParams();
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());
        Object.entries(filters || {}).forEach(([key, value]) => {
            if (key === 'page' || key === 'limit') return;
            if (value === undefined || value === null || value === '') return;
            params.append(key, value.toString());
        });
        const response = await this.service.get<ApiPaginatedResponse<T> | T[]>(`/${this.baseEndpoint}?${params.toString()}`);
        const payload = this.unwrapResponse<ListPayload | T[]>(response);
        const edges = Array.isArray(payload) ? payload : payload?.edges || [];
        const paginated = Array.isArray(payload) ? undefined : payload?.paginated;
        const fallbackPaginated = this.getEmptyPaginatedMeta();

        return {
            success: true,
            data: {
                edges,
                paginated: {
                    total: paginated?.total || fallbackPaginated.total,
                    cursor: paginated?.cursor || fallbackPaginated.cursor,
                    hasMore: paginated?.hasMore || fallbackPaginated.hasMore,
                    totalPages: paginated?.totalPages || fallbackPaginated.totalPages,
                    totalPerPage: paginated?.totalPerPage || fallbackPaginated.totalPerPage
                }
            },
            pagination: {
                page: filters?.page || 1,
                limit: filters?.limit || 10,
                total: paginated?.total || 0,
                totalPages: paginated?.totalPages || 0
            }
        };
    }
    async getById(id: number): Promise<T> {
        const response = await this.service.get<ApiResponse<T> | T>(`/${this.baseEndpoint}/${id}`);
        return this.unwrapResponse<T>(response);
    }
    async create(data: T): Promise<T> {
        const response = await this.service.post<ApiResponse<T> | T>(`/${this.baseEndpoint}`, data);
        return this.unwrapResponse<T>(response);
    }
    async update(id: number, data: Partial<T>): Promise<T> {
        const response = await this.service.put<ApiResponse<T> | T>(`/${this.baseEndpoint}/${id}`, data);
        return this.unwrapResponse<T>(response);
    }
    async delete(id: number): Promise<void> {
        await this.service.delete<ApiResponse<void>>(`/${this.baseEndpoint}/${id}`);
    }
}