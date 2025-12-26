import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import mongoose from 'mongoose';

/**
 * Global error handling middleware
 * Catches all errors and sends consistent error responses
 */
export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let error = err;

    // Handle Mongoose validation errors
    if (err instanceof mongoose.Error.ValidationError) {
        const errors = Object.values(err.errors).map((e: any) => ({
            field: e.path,
            message: e.message
        }));
        error = ApiError.badRequest('Validation failed', errors);
    }

    // Handle Mongoose duplicate key errors
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        error = ApiError.conflict(`${field} already exists`);
    }

    // Handle Mongoose CastError (invalid ObjectId)
    if (err instanceof mongoose.Error.CastError) {
        error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = ApiError.unauthorized('Invalid token');
    }

    if (err.name === 'TokenExpiredError') {
        error = ApiError.unauthorized('Token expired');
    }

    // Default to ApiError if not already
    if (!(error instanceof ApiError)) {
        error = new ApiError(
            err.statusCode || 500,
            err.message || 'Internal server error',
            false
        );
    }

    // Send error response
    const response: any = {
        success: false,
        message: error.message,
        statusCode: error.statusCode
    };

    // Include error details in development
    if (process.env.NODE_ENV === 'development') {
        response.stack = error.stack;
        response.errors = error.errors;
    } else if (error.errors) {
        // Include validation errors in production
        response.errors = error.errors;
    }

    res.status(error.statusCode).json(response);
};

/**
 * Handle 404 errors for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    const error = ApiError.notFound(`Route ${req.originalUrl} not found`);
    next(error);
};
