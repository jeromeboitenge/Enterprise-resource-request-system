import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

/**
 * ============================================
 * GLOBAL ERROR HANDLER
 * ============================================
 * 
 * This middleware catches all errors and sends consistent error responses.
 * It should be the last middleware in the application.
 * 
 * Handles different types of errors:
 * - Mongoose validation errors
 * - Mongoose duplicate key errors
 * - Mongoose cast errors (invalid ID)
 * - JWT errors
 * - Custom application errors
 */
export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Default error values
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Something went wrong';
    let errors = err.errors;

    // Handle Mongoose Validation Errors
    // Example: Missing required fields, invalid data types
    if (err instanceof mongoose.Error.ValidationError) {
        statusCode = 400;
        message = 'Validation failed';
        errors = Object.values(err.errors).map((e: any) => ({
            field: e.path,
            message: e.message
        }));
    }

    // Handle Mongoose Duplicate Key Errors
    // Example: Trying to create user with existing email
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyPattern)[0];
        message = `${field} already exists`;
    }

    // Handle Mongoose Cast Errors
    // Example: Invalid MongoDB ObjectId format
    if (err instanceof mongoose.Error.CastError) {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // Handle JWT Errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token. Please login again.';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired. Please login again.';
    }

    // Log error for debugging (in development)
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', err);
    }

    // Send error response
    const response: any = {
        success: false,
        message: message,
        statusCode: statusCode
    };

    // Include error stack in development mode
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    // Include validation errors if present
    if (errors) {
        response.errors = errors;
    }

    res.status(statusCode).json(response);
};

/**
 * ============================================
 * 404 NOT FOUND HANDLER
 * ============================================
 * 
 * This middleware handles requests to undefined routes.
 * It should be placed after all valid routes.
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        statusCode: 404
    });
};
