/**
 * HTTP Status Codes with Descriptions
 * 
 * This file provides named constants for HTTP status codes with descriptions.
 * Using named constants instead of magic numbers improves code readability.
 * 
 * @module constants/http-status
 */

/**
 * Success status codes (2xx)
 */
export const HTTP_STATUS = {
    /**
     * 200 OK - The request succeeded
     */
    OK: 200,

    /**
     * 201 Created - The request succeeded and a new resource was created
     */
    CREATED: 201,

    /**
     * 204 No Content - The request succeeded but there's no content to send
     */
    NO_CONTENT: 204,

    /**
     * 400 Bad Request - The server cannot process the request due to client error
     */
    BAD_REQUEST: 400,

    /**
     * 401 Unauthorized - Authentication is required and has failed or not been provided
     */
    UNAUTHORIZED: 401,

    /**
     * 403 Forbidden - The client does not have access rights to the content
     */
    FORBIDDEN: 403,

    /**
     * 404 Not Found - The server cannot find the requested resource
     */
    NOT_FOUND: 404,

    /**
     * 409 Conflict - The request conflicts with the current state of the server
     */
    CONFLICT: 409,

    /**
     * 422 Unprocessable Entity - The request was well-formed but contains semantic errors
     */
    UNPROCESSABLE_ENTITY: 422,

    /**
     * 429 Too Many Requests - The user has sent too many requests in a given time
     */
    TOO_MANY_REQUESTS: 429,

    /**
     * 500 Internal Server Error - The server encountered an unexpected condition
     */
    INTERNAL_SERVER_ERROR: 500,

    /**
     * 503 Service Unavailable - The server is not ready to handle the request
     */
    SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Type for HTTP status codes
 */
export type HttpStatusCode = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];

/**
 * HTTP status code descriptions
 * Useful for logging and debugging
 */
export const HTTP_STATUS_DESCRIPTIONS: Record<number, string> = {
    [HTTP_STATUS.OK]: 'OK',
    [HTTP_STATUS.CREATED]: 'Created',
    [HTTP_STATUS.NO_CONTENT]: 'No Content',
    [HTTP_STATUS.BAD_REQUEST]: 'Bad Request',
    [HTTP_STATUS.UNAUTHORIZED]: 'Unauthorized',
    [HTTP_STATUS.FORBIDDEN]: 'Forbidden',
    [HTTP_STATUS.NOT_FOUND]: 'Not Found',
    [HTTP_STATUS.CONFLICT]: 'Conflict',
    [HTTP_STATUS.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
    [HTTP_STATUS.TOO_MANY_REQUESTS]: 'Too Many Requests',
    [HTTP_STATUS.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
    [HTTP_STATUS.SERVICE_UNAVAILABLE]: 'Service Unavailable',
} as const;

/**
 * Helper function to get status description
 * 
 * @param statusCode - HTTP status code
 * @returns Description of the status code
 * 
 * @example
 * ```typescript
 * getStatusDescription(200) // Returns: "OK"
 * getStatusDescription(404) // Returns: "Not Found"
 * ```
 */
export const getStatusDescription = (statusCode: number): string => {
    return HTTP_STATUS_DESCRIPTIONS[statusCode] || 'Unknown Status';
};

/**
 * Helper function to check if status code indicates success (2xx)
 * 
 * @param statusCode - HTTP status code
 * @returns True if status code is in 2xx range
 * 
 * @example
 * ```typescript
 * isSuccessStatus(200) // Returns: true
 * isSuccessStatus(404) // Returns: false
 * ```
 */
export const isSuccessStatus = (statusCode: number): boolean => {
    return statusCode >= 200 && statusCode < 300;
};

/**
 * Helper function to check if status code indicates client error (4xx)
 * 
 * @param statusCode - HTTP status code
 * @returns True if status code is in 4xx range
 */
export const isClientError = (statusCode: number): boolean => {
    return statusCode >= 400 && statusCode < 500;
};

/**
 * Helper function to check if status code indicates server error (5xx)
 * 
 * @param statusCode - HTTP status code
 * @returns True if status code is in 5xx range
 */
export const isServerError = (statusCode: number): boolean => {
    return statusCode >= 500 && statusCode < 600;
};
