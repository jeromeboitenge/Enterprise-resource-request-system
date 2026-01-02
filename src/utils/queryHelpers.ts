/**
 * Query Building Helpers
 * 
 * Utilities for building database queries and filters in a clean, consistent way.
 */

/**
 * Build filter object from query parameters
 * 
 * Creates a MongoDB filter object from request query parameters,
 * automatically excluding undefined, null, and empty string values.
 * 
 * @param params - Object containing query parameters
 * @returns Filter object for MongoDB queries
 * 
 * @example
 * ```typescript
 * const filter = buildFilter({
 *   status: req.query.status,
 *   departmentId: req.query.departmentId,
 *   priority: req.query.priority
 * });
 * // Returns: { status: 'submitted', departmentId: '123' }
 * // (excludes undefined/null values)
 * ```
 */
export const buildFilter = (params: Record<string, any>): Record<string, any> => {
    const filter: Record<string, any> = {};

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            filter[key] = value;
        }
    });

    return filter;
};

/**
 * Build date range filter
 * 
 * Creates a MongoDB date range filter for a specified field.
 * 
 * @param startDate - Start date (ISO string or Date)
 * @param endDate - End date (ISO string or Date)
 * @param fieldName - Name of the date field to filter
 * @returns Filter object with date range
 * 
 * @example
 * ```typescript
 * const dateFilter = buildDateRangeFilter(
 *   '2026-01-01',
 *   '2026-01-31',
 *   'createdAt'
 * );
 * // Returns: { createdAt: { $gte: Date(...), $lte: Date(...) } }
 * ```
 */
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

/**
 * Build search filter for text fields
 * 
 * Creates a case-insensitive regex filter for searching text fields.
 * 
 * @param searchTerm - Search term
 * @param fields - Array of field names to search
 * @returns Filter object with $or condition
 * 
 * @example
 * ```typescript
 * const searchFilter = buildSearchFilter(
 *   'laptop',
 *   ['title', 'description', 'resourceName']
 * );
 * // Returns: { $or: [
 * //   { title: { $regex: 'laptop', $options: 'i' } },
 * //   { description: { $regex: 'laptop', $options: 'i' } },
 * //   { resourceName: { $regex: 'laptop', $options: 'i' } }
 * // ]}
 * ```
 */
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

/**
 * Build pagination options
 * 
 * Creates pagination parameters for MongoDB queries.
 * 
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @returns Object with skip and limit values
 * 
 * @example
 * ```typescript
 * const { skip, limit } = buildPaginationOptions(2, 10);
 * const results = await Model.find().skip(skip).limit(limit);
 * ```
 */
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

/**
 * Build sort options
 * 
 * Creates sort object from query parameters.
 * 
 * @param sortBy - Field to sort by
 * @param sortOrder - Sort order ('asc' or 'desc')
 * @returns Sort object for MongoDB
 * 
 * @example
 * ```typescript
 * const sort = buildSortOptions('createdAt', 'desc');
 * const results = await Model.find().sort(sort);
 * // Returns: { createdAt: -1 }
 * ```
 */
export const buildSortOptions = (
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
): Record<string, 1 | -1> => {
    return {
        [sortBy]: sortOrder === 'asc' ? 1 : -1
    };
};

/**
 * Merge multiple filters
 * 
 * Combines multiple filter objects into a single filter.
 * 
 * @param filters - Array of filter objects
 * @returns Combined filter object
 * 
 * @example
 * ```typescript
 * const filter = mergeFilters([
 *   buildFilter({ status: 'submitted' }),
 *   buildDateRangeFilter('2026-01-01', '2026-01-31'),
 *   { userId: req.user._id }
 * ]);
 * ```
 */
export const mergeFilters = (...filters: Record<string, any>[]): Record<string, any> => {
    return Object.assign({}, ...filters);
};
