// src/common/pagination/types/paginated-response.ts
export type PaginationMeta = {
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
    page: number;
    pageCount: number;
    total: number;
};

export type PaginatedResponse<T> = {
    data: T[];
    meta: PaginationMeta;
};
