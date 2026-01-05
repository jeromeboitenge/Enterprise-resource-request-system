import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Something went wrong';
    let errors = err.errors;

    // Prisma Unique Constraint Violation
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            statusCode = 409;
            const target = (err.meta as any)?.target;
            message = target ? `${target} already exists` : 'Record with this unique field already exists';
        }
        if (err.code === 'P2025') {
            statusCode = 404;
            message = 'Record not found';
        }
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
