export interface PaginationQuery {
    page?: string | number;
    limit?: string | number;
}

export interface PaginationResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export const getPaginationParams = (
    query: PaginationQuery,
    defaultLimit: number = 5,
    maxLimit: number = 5
) => {
    const page = Math.max(1, Number(query.page) || 1);
    let limit = Math.max(1, Number(query.limit) || defaultLimit);

    if (limit > maxLimit) {
        limit = maxLimit;
    }

    const skip = (page - 1) * limit;

    return { page, limit, skip, take: limit };
};

export const createPaginatedResponse = <T>(
    data: T[],
    total: number,
    page: number,
    limit: number
): PaginationResult<T> => {
    const totalPages = Math.ceil(total / limit);

    return {
        data,
        meta: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    };
};
