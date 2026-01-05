import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../model/user';

// Extend Express Request to include user property
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

/**
 * ============================================
 * AUTHENTICATION MIDDLEWARE
 * ============================================
 * 
 * This middleware verifies JWT tokens and attaches user to request.
 * It protects routes that require authentication.
 * 
 * How it works:
 * 1. Get token from Authorization header
 * 2. Verify token is valid
 * 3. Find user in database
 * 4. Attach user to request object
 * 5. Allow request to continue
 * 
 * Usage in routes:
 * router.get('/profile', authenticate, getProfile);
 */
export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Step 1: Get token from Authorization header
        // Expected format: "Bearer <token>"
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Please login first.'
            });
        }

        // Extract token (remove "Bearer " prefix)
        const token = authHeader.split(' ')[1];

        // Step 2: Verify token using JWT secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

        // Step 3: Find user in database using ID from token
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Token may be invalid.'
            });
        }

        // Step 4: Attach user to request object
        // Now other middleware and controllers can access req.user
        req.user = user;

        // Step 5: Continue to next middleware/controller
        next();

    } catch (error: any) {
        // Handle JWT errors
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please login again.'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }

        // Handle other errors
        return res.status(401).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};
