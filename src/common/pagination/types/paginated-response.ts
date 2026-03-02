// src/common/pagination/types/paginated-response.ts
export type PaginationMeta = {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
};

export type PaginatedResponse<T> = {
    data: T[];
    meta: PaginationMeta;
};
