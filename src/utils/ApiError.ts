
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

        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message: string, errors?: any[]): ApiError {
        return new ApiError(400, message, true, errors);
    }

    static unauthorized(message: string = 'Unauthorized'): ApiError {
        return new ApiError(401, message);
    }

    static forbidden(message: string = 'Forbidden'): ApiError {
        return new ApiError(403, message);
    }

    static notFound(message: string = 'Resource not found'): ApiError {
        return new ApiError(404, message);
    }

    static conflict(message: string): ApiError {
        return new ApiError(409, message);
    }

    static internal(message: string = 'Internal server error'): ApiError {
        return new ApiError(500, message, false);
    }
}
