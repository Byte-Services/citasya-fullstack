import { DataSource, Repository, FindOneOptions, FindOptionsOrder, SelectQueryBuilder, ObjectLiteral } from "typeorm";
import { Logger } from "./logger.js";
import { HttpException, NotFoundException } from "./exeptions.js";
import { FindAllPaginated, ResultPaginated } from "./dtos.js";


export class BaseOrmService<T extends ObjectLiteral> {
    private readonly logger = new Logger(BaseOrmService.name);
    protected entity: any;

    constructor(
        private repository: Repository<T>
    ){
        this.entity = repository.target;
    }

    async create(payload: any): Promise<T> {
    try {
      const data = await this.repository.save(payload);
      this.logger.log(
        `Data created successfully with id: ${JSON.stringify(data)}`,
      );
      return data;
    } catch (e: any) {
      this.logger.error(`Something went wrong saving new data :${e?.message}`);
      throw new HttpException(e.message || e, e.status || 500);
    }
  }

  async update(id: string | number | object, updates: any): Promise<T> {
    try {

      let query = {}

      if (typeof id === 'string' || typeof id === 'number') {
        query = { id }
      } else {
        query = id
      }


      const item = await this.repository.findOneBy(query);
      if (!item) {
        this.logger.error(`Item not found id:${id}`);
        throw new NotFoundException('Not found');
      }
      Object.assign(item, updates);
      this.logger.debug(
        `Data updated successfully id: ${id}, newData: ${JSON.stringify(item)}`,
      );
      return await this.repository.save(item);
    } catch (e: any) {
      this.logger.error(
        `Something went wrong updating new data :${e?.message}`,
      );
      throw new HttpException(e.message || e, e.status || 500);
    }
  }

  async delete(id: any) {
    const item = await this.findOne(id);
    if (item) {
      const res = await this.repository.softDelete({ id });
    }
    this.logger.debug(`Item deleted successfully`);
    return { message: 'success' };
  }

  async deletePermanently(id: any) {
    const item = await this.findOne(id);
    if (item) {
      await this.repository.delete({ id });
    }
    this.logger.debug(`Item deleted successfully`);
    return { message: 'success' };
  }


  async softDelete(id: any) {
    const item = await this.findOne(id);
    if (item) {
      await this.repository.softDelete({ id });
    }
    this.logger.debug(`Item deleted successfully`);
    return { message: 'success' };
  }


  async createMany(payload: any[]): Promise<T[]> {
    try {
      const data = await this.repository.save(payload);
      this.logger.log(
        `Data created successfully with id: ${JSON.stringify(data)}`,
      );
      return data;
    } catch (error: any) {
      this.logger.error(`Something went wrong saving new data :${error?.message}`);
      throw new HttpException(error.message || error, error.status || 500);
    }
  }

  async findOne(id: any): Promise<T> {
    try {
      const item = await this.repository.findOneBy({ id });
      if (!item) {
        this.logger.error(`Item not found id:${id}`);
        throw new NotFoundException(`${(this.entity as any)?.name || 'Entity'} not found`);
      }
      return item;
    } catch (error: any) {
      this.logger.error(`Something went wrong finding an item: ${error?.message}`);
      throw new HttpException(error.message || error, error.status || 500);
    }
  }

  async findOneWithOptions(options: FindOneOptions<T>): Promise<T> {
    try {
      const item = await this.repository.findOne(options);
      if (!item) {
        this.logger.error(`Item not found ${JSON.stringify(options)}`);
        throw new NotFoundException(`${(this.entity as any)?.name || 'Entity'} not found`);
      }
      return item;
    } catch (error: any) {
      this.logger.error(`Something went wrong finding an item: ${error?.message}`);
      throw new HttpException(error.message || error, error.status || 500);
    }
  }


  async findAll(options?: {
    skip?: number;
    take?: number;
    relations?: string[];
    order?: FindOptionsOrder<T>;
    query?: any;
  }): Promise<T[]> {
    try {
      const { skip, take, relations, order, query } = options || {};
      this.logger.debug(
        `Search data with : ${JSON.stringify(options, null, 2)}`,
      );
      return await this.repository.find({
        where: query,
        skip,
        take,
        relations,
        order: order || {},
      });
    } catch (error: any) {
      this.logger.error(`Something went wrong find many data: ${error?.message}`);
      throw new HttpException(error.message || error, error.status || 500);
    }
  }

  async findOneBy(query: object): Promise<T | null> {
    try {
      const item = await this.repository.findOneBy(query);
      if (!item) {
        this.logger.error(`Error finding data with ${JSON.stringify(item)}`);
        return null;
      }
      return item;
    } catch (error: any) {
      this.logger.error(`Something went wrong find data: ${error?.message}`);
      throw new HttpException(error.message || error, error.status || 500);
    }
  }

  async findBy(
    query: object,
    options?: { skip?: number; take?: number; order?: FindOptionsOrder<any>, relations?: string[] },
  ): Promise<T[]> {
    try {
      const { skip, take, order, relations } = options || {};
      this.logger.debug(
        `Search data with : ${JSON.stringify(options, null, 2)}`,
      );
      return await this.repository.find({
        where: query,
        skip,
        take,
        order,
        relations,
      });
    } catch (error: any) {
      this.logger.error(`Something went wrong find many data: ${error?.message}`);
      throw new HttpException(error.message || error, error.status || 500);
    }
  }

  protected buildFindAllQuery(
    data: FindAllPaginated,
    tableName?: string,
    filters?: { [key: string]: any },
  ): SelectQueryBuilder<T | any> {
    const {
      // cursor,
      fieldSort = 'createdAt',
      skip,
      page,
      short = 'DESC',
      limit = 10,
      relations = [],
    } = data;

    if (!tableName) {
      tableName = 'entity';
    }
    const query = this.repository.createQueryBuilder(tableName);

    if (skip) {
      query.skip(skip).take(limit);
    }

    if (page) {
      query.skip((page - 1) * limit).take(limit);
    } else {
      query.take(limit);
    }

    if (relations && relations.length > 0) {
      relations.forEach((relation) => {
        const relationParts = relation.split('.');
        if (relationParts.length > 1) {
          const alias = relationParts[relationParts.length - 1];
          query.leftJoinAndSelect(relation, alias);
        } else {
          query.leftJoinAndSelect(`${tableName}.${relation}`, relation);
        }
      });
    }
    if (short) {
      query.orderBy(`${tableName}.${fieldSort || 'id'}`, short);
    }

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (!key.includes('isNull')) {
          let valueParse = value;
          let validator = ' = ';
          let keyParse = `:${key}`;
          let actualKey = key;

          // This is for the boolean values
          if (value == 'true' || value == 'false') {
            valueParse = value == 'true';
          } else if (!isNaN(Number(value))) {
            valueParse = Number(value);
          } else if (key.endsWith('Id') || key.endsWith('Enum')) {
            if (key.endsWith('Enum')) {
              actualKey = key.replace(/Enum$/, '');
              keyParse = `:${actualKey}`;
            }

          } else {
            validator = ' ILIKE ';
            valueParse = `%${valueParse}%`;
            keyParse = `:${key}`;
          }

          query.andWhere(`${tableName}.${actualKey} ${validator} ${keyParse}`, {
            [actualKey]: valueParse,
          });
        } else {
          const valueBolean: boolean =
            typeof value == 'boolean' ? value : value == 'true';
          const queryText = `${tableName}.${key.replace('isNull', '')} ${valueBolean ? 'IS NULL' : 'IS NOT NULL'}`;
          query.andWhere(queryText);
        }
      });
    }

    return query;
  }

  /**
   * We have to separate all of this data
   * @param query
   * @param data
   * @param tableName
   * @returns query
   */
  protected buildCursor(
    query: SelectQueryBuilder<T | any>,
    data: FindAllPaginated,
    tableName?: string,
  ): SelectQueryBuilder<T | any> {
    const {
      cursor,
      fieldSort,
      short = 'DESC',
    } = data;

    if (!tableName) {
      tableName = 'entity';
    }

    if (cursor) {
      query.andWhere(`${tableName}.${fieldSort || 'id'} ${short == 'ASC' ? '>' : '<'} :cursor`, {
        cursor,
      });
    }

    return query;
  }
  protected async buildFindAllQueryAndRun(
    paginated?: FindAllPaginated,
    filters?: { [key: string]: any },
    tableName?: string,
  ) {
    this.logger.debug('Building all filters for findAll');
    const totalQuery = this.buildFindAllQuery(paginated ?? {}, tableName, filters);
    const mainQuery = this.buildCursor(totalQuery.clone(), paginated ?? {}, tableName);

    const total = await totalQuery.getCount();
    const [result] = await mainQuery.getManyAndCount();

    const responseData: ResultPaginated<T> = {
      edges: result,
      paginated: {
        total,
        cursor: (result[result.length - 1] as any)?.id ?? null,
        hasMore: result.length >= (paginated?.limit ?? 10),
        totalPages: (result[result.length - 1] as any)?.id
          ? Math.max(1, Math.ceil(total / (paginated?.limit ?? 10)))
          : 0,
        totalPerPage: result.length,
      },
    };

    return responseData;
  }

  async findAllPaginatedData(
    paginated: FindAllPaginated,
    filters?: { [key: string]: any },
    tableName?: string,
  ) {
    const response = await this.buildFindAllQueryAndRun(
      paginated,
      filters,
      tableName,
    );

    return response;
  }

  buildFilters(data: { [key: string]: any }) {
    // Here we remove all fields that we don't need
    const newFilterData = { ...data };
    delete newFilterData?.cursor;
    delete newFilterData?.skip;
    delete newFilterData?.page;
    delete newFilterData?.short;
    delete newFilterData?.limit;
    delete newFilterData?.fieldSort;

    this.logger.debug(`Filters: ${JSON.stringify(newFilterData)}`);
    return newFilterData;
  }

  getQueryBuilder(tableName?: string) {
    if (!tableName) {
      tableName = 'entity';
    }
    return this.repository.createQueryBuilder(tableName);
  }


    

}