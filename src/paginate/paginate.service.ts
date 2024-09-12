import { Injectable } from '@nestjs/common';
import { FilterOptions, PaginatedResult } from './types';

@Injectable()
export class PaginateService {
  async paginator<T, W, S, I, O>(
    filters: FilterOptions<W, S, I, O>,
  ): Promise<PaginatedResult<T>> {
    const { paginate, model, condition, includeOrSelect, orderBy } = filters;

    let page: number;
    let limit: number;
    let skip: number;
    if (paginate?.pagination && paginate?.pagination.toString() === 'true') {
      page = Number(paginate?.page) || 1;
      limit = Number(paginate?.limit) || 10;
      skip = page > 0 ? limit * (page - 1) : 0;
    }
    const includeOrSelectObj =
      includeOrSelect && includeOrSelect['operator']
        ? { [includeOrSelect['operator']]: includeOrSelect['value'] }
        : {};
    const [total, docs] = await Promise.all([
      model.count({ where: condition.where }),
      model.findMany({
        ...condition,
        take: limit,
        skip,
        orderBy,

        ...includeOrSelectObj,
      }),
    ]);
    const lastPage = Math.ceil(total / limit);

    return {
      docs,
      meta: {
        total,
        lastPage,
        currentPage: page,
        limit,
        prev: page > 1 ? page - 1 : null,
        next: page < lastPage ? page + 1 : null,
      },
    };
  }
}
