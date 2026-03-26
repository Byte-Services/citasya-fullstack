// Tipos para las respuestas estándar de la API
export type ApiResponse<T> = {
  response: {
    message: string;
    data: T;
    statusCode: number;
  };
};

// Tipo para la respuesta paginada de la API
export type ApiPaginatedResponse<T> = {
  response: {
    message: string;
    data: {
      edges: T[];
      paginated: {
        total: number;
        cursor: string;
        hasMore: boolean;
        totalPages: number;
        totalPerPage: number;
      };
    };
    statusCode: number;
  };
};
