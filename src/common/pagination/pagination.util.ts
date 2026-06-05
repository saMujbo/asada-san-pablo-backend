// src/common/pagination/pagination.util.ts
import { PaginationMeta } from './types/paginated-response';

export function buildPaginationMeta(params: {
    total: number;
    page: number;
    limit: number;
    pageCount: number;
}): PaginationMeta {
    const { total, page, limit} = params;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
        total,   
        page,
        limit,
        pageCount: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
}
