const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
 
export function parsePagination(query) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(
        MAX_LIMIT,
        Math.max(1, Number(query.limit) || DEFAULT_LIMIT)
    );
    const offset = (page - 1) * limit; // entries to ignore
 
    return { page, limit, offset };
}

export function buildPaginationMeta({ page, limit, total }) {
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
}