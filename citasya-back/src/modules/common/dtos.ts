/**
 * @swagger
 * components:
 *   schemas:
 *     FindAllPaginated:
 *       type: object
 *       description: Parámetros para paginación y filtrado de consultas
 *       properties:
 *         cursor:
 *           type: string
 *           description: Cursor para paginación basada en cursor
 *           example: "eyJpZCI6MTIzfQ=="
 *         fieldSort:
 *           type: string
 *           description: Campo por el cual ordenar los resultados
 *           example: "createdAt"
 *           default: "createdAt"
 *         skip:
 *           type: integer
 *           description: Número de registros a omitir (para paginación offset)
 *           minimum: 0
 *           example: 0
 *         page:
 *           type: integer
 *           description: Número de página (alternativa a skip)
 *           minimum: 1
 *           example: 1
 *         short:
 *           type: string
 *           enum: [ASC, DESC]
 *           description: Dirección del ordenamiento
 *           example: "DESC"
 *           default: "DESC"
 *         limit:
 *           type: integer
 *           description: Número máximo de registros a retornar
 *           minimum: 1
 *           maximum: 100
 *           example: 10
 *           default: 10
 *         relations:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista de relaciones a incluir en la consulta
 *           example: ["user", "category"]
 */
export class FindAllPaginated {
  cursor?: string;
  fieldSort?: string;
  skip?: number;
  page?: number;
  short?: 'ASC' | 'DESC';
  limit?: number;
  relations?: string[];
}

/**
 * @swagger
 * components:
 *   schemas:
 *     PaginatedInfo:
 *       type: object
 *       description: Información de paginación
 *       properties:
 *         total:
 *           type: integer
 *           description: Total de registros disponibles
 *           example: 150
 *         cursor:
 *           type: string
 *           nullable: true
 *           description: Cursor para la siguiente página
 *           example: "eyJpZCI6MTIzfQ=="
 *         hasMore:
 *           type: boolean
 *           description: Indica si hay más registros disponibles
 *           example: true
 *         totalPages:
 *           type: integer
 *           description: Total de páginas disponibles
 *           example: 15
 *         totalPerPage:
 *           type: integer
 *           description: Número de registros en la página actual
 *           example: 10
 *     
 *     ResultPaginated:
 *       type: object
 *       description: Respuesta paginada genérica
 *       properties:
 *         edges:
 *           type: array
 *           items:
 *             type: object
 *           description: Array de elementos de la página actual
 *         paginated:
 *           $ref: '#/components/schemas/PaginatedInfo'
 *       example:
 *         edges:
 *           - id: 1
 *             name: "Ejemplo 1"
 *             createdAt: "2024-01-01T00:00:00Z"
 *           - id: 2
 *             name: "Ejemplo 2"
 *             createdAt: "2024-01-02T00:00:00Z"
 *         paginated:
 *           total: 150
 *           cursor: "eyJpZCI6Mn0="
 *           hasMore: true
 *           totalPages: 15
 *           totalPerPage: 2
 */
export class ResultPaginated<T> {
  declare edges: T[];
  declare paginated: {
    total: number;
    cursor: string | null;
    hasMore: boolean;
    totalPages: number;
    totalPerPage: number;
  };
}