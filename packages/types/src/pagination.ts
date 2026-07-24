export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<TItem> {
  data: TItem[];
  meta: PaginationMeta;
}
