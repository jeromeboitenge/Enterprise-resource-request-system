import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Something went wrong';
    let errors = err.errors;

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

export const notFoundHandler = (req: Request, res: Response, _next: NextFunction) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        statusCode: 404
    });
};
