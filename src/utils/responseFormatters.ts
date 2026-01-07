

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export const formatListResponse = <T>(
    items: T[],
    additionalData?: Record<string, any>
) => {
    return {
        count: items.length,
        items,
        ...additionalData
    };
};

export const formatPaginatedResponse = <T>(
    items: T[],
    page: number,
    limit: number,
    total: number
) => {
    const totalPages = Math.ceil(total / limit);

    const pagination: Pagination = {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
    };

    return {
        items,
        pagination
    };
};

export const formatSingleItemResponse = <T>(
    item: T,
    itemName: string
): Record<string, T> => {
    return {
        [itemName]: item
    };
};

export const formatCountResponse = (counts: Record<string, number>) => {
    return {
        counts,
        total: Object.values(counts).reduce((sum, count) => sum + count, 0)
    };
};

export const formatSummaryResponse = (summary: Record<string, any>) => {
    return {
        summary,
        generatedAt: new Date().toISOString()
    };
};

export const formatValidationErrors = (
    errors: Array<{ field: string; message: string }>
) => {
    return {
        errors,
        count: errors.length
    };
};
