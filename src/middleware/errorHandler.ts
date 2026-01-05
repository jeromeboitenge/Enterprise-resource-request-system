import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Something went wrong';
    let errors = err.errors;

    if (err instanceof mongoose.Error.ValidationError) {
        statusCode = 400;
        message = 'Validation failed';
        errors = Object.values(err.errors).map((e: any) => ({
            field: e.path,
            message: e.message
        }));
    }

    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyPattern)[0];
        message = `${field} already exists`;
    }

    if (err instanceof mongoose.Error.CastError) {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token. Please login again.';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired. Please login again.';
    }

    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', err);
    }

    const response: any = {
        success: false,
        message: message,
        statusCode: statusCode
    };

    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    if (errors) {
        response.errors = errors;
    }

    res.status(statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        statusCode: 404
    });
};
