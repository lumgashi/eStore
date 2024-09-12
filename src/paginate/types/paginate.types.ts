export interface PaginatedResult<T> {
  docs: T[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    prev: number | null;
    next: number | null;
    limit: number | string;
  };
}

export type FilterOptions<W, S, I, O> = {
  paginate?: PaginateOptions;
  model: any;
  condition: { where: W };
  includeOrSelect?:
    | { operator: 'select'; value: S }
    | { operator: 'include'; value: I };
  orderBy?: O;
};

export type PaginateOptions = {
  page?: number | string;
  limit?: number | string;
  pagination: boolean;
};

export type SelectItem = {
  [key: string]: true;
};

export type IncludeItem = {
  [key: string]: true;
};
