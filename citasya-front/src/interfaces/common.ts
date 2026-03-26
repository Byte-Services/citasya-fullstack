// Interfaces comunes para la API

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T>
  extends ApiResponse<{
    edges: T[];
    paginated: {
      total: number;
      cursor?: string;
      hasMore: boolean;
      totalPages: number;
      totalPerPage: number;
    };
  }> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  deleted_at?: string;
}
