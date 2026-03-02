// src/common/pagination/pagination.util.ts
import { PaginationMeta } from './types/paginated-response';

export function buildPaginationMeta(params: {
    totalItems: number;
    page: number;
    limit: number;
    itemCount: number;
}): PaginationMeta {
    const { totalItems, page, limit, itemCount } = params;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    return {
        totalItems,
        itemCount,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
}
