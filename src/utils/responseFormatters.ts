/**
 * Response Formatting Helpers
 * 
 * Utilities for formatting API response data in a consistent way.
 */

/**
 * Pagination metadata interface
 */
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

/**
 * Format list response
 * 
 * Creates a consistent format for list/array responses.
 * 
 * @param items - Array of items
 * @param additionalData - Optional additional data to include
 * @returns Formatted response object
 * 
 * @example
 * ```typescript
 * const data = formatListResponse(requests, {
 *   totalEstimatedCost: 15000
 * });
 * // Returns: {
 * //   count: 5,
 * //   items: [...],
 * //   totalEstimatedCost: 15000
 * // }
 * ```
 */
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

/**
 * Format paginated response
 * 
 * Creates a paginated response with metadata.
 * 
 * @param items - Array of items for current page
 * @param page - Current page number
 * @param limit - Items per page
 * @param total - Total number of items
 * @returns Formatted paginated response
 * 
 * @example
 * ```typescript
 * const data = formatPaginatedResponse(requests, 2, 10, 45);
 * // Returns: {
 * //   items: [...],
 * //   pagination: {
 * //     page: 2,
 * //     limit: 10,
 * //     total: 45,
 * //     totalPages: 5,
 * //     hasNext: true,
 * //     hasPrev: true
 * //   }
 * // }
 * ```
 */
export const formatPaginatedResponse = <T>(
    items: T[],
    page: number,
    limit: number,
    total: number
) => {
    const totalPages = Math.ceil(total / limit);

    const pagination: PaginationMeta = {
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

/**
 * Format single item response
 * 
 * Wraps a single item in a consistent format.
 * 
 * @param item - Single item
 * @param itemName - Name of the item (e.g., 'user', 'request')
 * @returns Formatted response object
 * 
 * @example
 * ```typescript
 * const data = formatSingleItemResponse(user, 'user');
 * // Returns: { user: {...} }
 * ```
 */
export const formatSingleItemResponse = <T>(
    item: T,
    itemName: string
): Record<string, T> => {
    return {
        [itemName]: item
    };
};

/**
 * Format count response
 * 
 * Creates a response for count/statistics queries.
 * 
 * @param counts - Object with count data
 * @returns Formatted count response
 * 
 * @example
 * ```typescript
 * const data = formatCountResponse({
 *   total: 100,
 *   pending: 25,
 *   approved: 50,
 *   rejected: 25
 * });
 * ```
 */
export const formatCountResponse = (counts: Record<string, number>) => {
    return {
        counts,
        total: Object.values(counts).reduce((sum, count) => sum + count, 0)
    };
};

/**
 * Format summary response
 * 
 * Creates a response with aggregated summary data.
 * 
 * @param summary - Summary data object
 * @returns Formatted summary response
 * 
 * @example
 * ```typescript
 * const data = formatSummaryResponse({
 *   totalRequests: 100,
 *   totalAmount: 50000,
 *   averageAmount: 500,
 *   byStatus: { pending: 25, approved: 75 }
 * });
 * ```
 */
export const formatSummaryResponse = (summary: Record<string, any>) => {
    return {
        summary,
        generatedAt: new Date().toISOString()
    };
};

/**
 * Format error details for validation errors
 * 
 * Formats validation errors in a consistent structure.
 * 
 * @param errors - Array of error objects
 * @returns Formatted error details
 * 
 * @example
 * ```typescript
 * const errorDetails = formatValidationErrors([
 *   { field: 'email', message: 'Invalid email format' },
 *   { field: 'password', message: 'Password too short' }
 * ]);
 * ```
 */
export const formatValidationErrors = (
    errors: Array<{ field: string; message: string }>
) => {
    return {
        errors,
        count: errors.length
    };
};
