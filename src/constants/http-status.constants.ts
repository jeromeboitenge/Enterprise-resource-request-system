

export const HTTP_STATUS = {

    OK: 200,

    CREATED: 201,

    NO_CONTENT: 204,

    BAD_REQUEST: 400,

    UNAUTHORIZED: 401,

    FORBIDDEN: 403,

    NOT_FOUND: 404,

    CONFLICT: 409,

    UNPROCESSABLE_ENTITY: 422,

    TOO_MANY_REQUESTS: 429,

    INTERNAL_SERVER_ERROR: 500,

    SERVICE_UNAVAILABLE: 503,
} as const;

export type HttpStatusCode = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];

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

export const getStatusDescription = (statusCode: number): string => {
    return HTTP_STATUS_DESCRIPTIONS[statusCode] || 'Unknown Status';
};

export const isSuccessStatus = (statusCode: number): boolean => {
    return statusCode >= 200 && statusCode < 300;
};

export const isClientError = (statusCode: number): boolean => {
    return statusCode >= 400 && statusCode < 500;
};

export const isServerError = (statusCode: number): boolean => {
    return statusCode >= 500 && statusCode < 600;
};
