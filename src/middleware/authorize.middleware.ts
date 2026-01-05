import { Request, Response, NextFunction } from 'express';

/**
 * ============================================
 * AUTHORIZATION MIDDLEWARE
 * ============================================
 * 
 * This middleware restricts access based on user roles.
 * Only users with allowed roles can access the route.
 * 
 * How it works:
 * 1. Check if user is authenticated
 * 2. Check if user's role is in allowed roles
 * 3. Allow or deny access
 * 
 * Usage in routes:
 * router.post('/departments', authenticate, authorize('admin'), createDepartment);
 * router.get('/requests', authenticate, authorize('manager', 'finance', 'admin'), getAllRequests);
 */
export const authorize = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Step 1: Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please login first.'
            });
        }

        // Step 2: Check if user's role is in allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. This action requires one of these roles: ${allowedRoles.join(', ')}`
            });
        }

        // Step 3: User has required role, allow access
        next();
    };
};
