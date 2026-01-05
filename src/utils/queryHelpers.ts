

export const buildFilter = (params: Record<string, any>): Record<string, any> => {
    const filter: Record<string, any> = {};

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            filter[key] = value;
        }
    });

    return filter;
};

export const buildDateRangeFilter = (
    startDate?: string | Date,
    endDate?: string | Date,
    fieldName: string = 'createdAt'
): Record<string, any> => {
    const filter: Record<string, any> = {};

    if (startDate || endDate) {
        filter[fieldName] = {};
        if (startDate) {
            filter[fieldName].$gte = new Date(startDate);
        }
        if (endDate) {
            filter[fieldName].$lte = new Date(endDate);
        }
    }

    return filter;
};

export const buildSearchFilter = (
    searchTerm: string,
    fields: string[]
): Record<string, any> => {
    if (!searchTerm || fields.length === 0) {
        return {};
    }

    return {
        $or: fields.map(field => ({
            [field]: { $regex: searchTerm, $options: 'i' }
        }))
    };
};

export const buildPaginationOptions = (
    page: number = 1,
    limit: number = 10
): { skip: number; limit: number } => {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100); // Max 100 items per page

    return {
        skip: (validPage - 1) * validLimit,
        limit: validLimit
    };
};

export const buildSortOptions = (
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
): Record<string, 1 | -1> => {
    return {
        [sortBy]: sortOrder === 'asc' ? 1 : -1
    };
};

export const mergeFilters = (...filters: Record<string, any>[]): Record<string, any> => {
    return Object.assign({}, ...filters);
};
