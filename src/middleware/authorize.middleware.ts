import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { Roles } from '../types/user.interface';

/**
 * Authorization middleware - Restricts access based on user roles
 * @param allowedRoles - Array of roles that are allowed to access the route
 */
export const authorize = (...allowedRoles: Roles[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(ApiError.unauthorized('Authentication required'));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(
                ApiError.forbidden(
                    `Access denied. Required roles: ${allowedRoles.join(', ')}`
                )
            );
        }

        next();
    };
};
