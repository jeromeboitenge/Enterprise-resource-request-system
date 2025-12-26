import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { ApiError } from '../utils/ApiError';
import User from '../model/user';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

/**
 * Authentication middleware - Verifies JWT token and attaches user to request
 */
export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw ApiError.unauthorized('No token provided');
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, config.jwtSecret) as any;

        // Get user from database
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            throw ApiError.unauthorized('User not found');
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error: any) {
        if (error instanceof ApiError) {
            next(error);
        } else {
            next(ApiError.unauthorized('Invalid token'));
        }
    }
};
