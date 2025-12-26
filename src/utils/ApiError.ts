/**
 * Custom API Error class for consistent error handling
 */
export class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;
    errors?: any[];

    constructor(
        statusCode: number,
        message: string,
        isOperational = true,
        errors?: any[]
    ) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.errors = errors;

        // Maintains proper stack trace for where error was thrown
        Error.captureStackTrace(this, this.constructor);
    }

    /**
     * Create a Bad Request (400) error
     */
    static badRequest(message: string, errors?: any[]): ApiError {
        return new ApiError(400, message, true, errors);
    }

    /**
     * Create an Unauthorized (401) error
     */
    static unauthorized(message: string = 'Unauthorized'): ApiError {
        return new ApiError(401, message);
    }

    /**
     * Create a Forbidden (403) error
     */
    static forbidden(message: string = 'Forbidden'): ApiError {
        return new ApiError(403, message);
    }

    /**
     * Create a Not Found (404) error
     */
    static notFound(message: string = 'Resource not found'): ApiError {
        return new ApiError(404, message);
    }

    /**
     * Create a Conflict (409) error
     */
    static conflict(message: string): ApiError {
        return new ApiError(409, message);
    }

    /**
     * Create an Internal Server Error (500)
     */
    static internal(message: string = 'Internal server error'): ApiError {
        return new ApiError(500, message, false);
    }
}
