import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';


export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // 1. Check if Authorization header exists
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'No token provided. Please login first.'
            });
            return;
        }

        // 2. Extract token
        const token = authHeader.split(' ')[1];

        // 3. Verify token signature and expiration
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

        // 4. Fetch user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                departmentId: true,
                isActive: true,
                failedLoginAttempts: true,
                accountLockedUntil: true,
                createdAt: true,
                updatedAt: true
            }
        });

        // 5. Check if user exists
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found. Your account may have been deleted. Please contact administrator.'
            });
            return;
        }

        // 6. Check if account is active
        if (!user.isActive) {
            res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Please contact administrator.'
            });
            return;
        }

        // 7. Check if account is locked
        if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
            const lockTimeRemaining = Math.ceil((user.accountLockedUntil.getTime() - Date.now()) / 60000);
            res.status(403).json({
                success: false,
                message: `Your account is temporarily locked due to multiple failed login attempts. Please try again in ${lockTimeRemaining} minutes.`
            });
            return;
        }

        // 8. Verify role matches (security check for role changes)
        if (user.role !== decoded.role) {
            res.status(401).json({
                success: false,
                message: 'Your account permissions have changed. Please login again.'
            });
            return;
        }

        // 9. Attach user to request
        req.user = user;

        next();
    } catch (error: any) {
        // Handle JWT-specific errors
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({
                success: false,
                message: 'Your session has expired. Please login again.',
                code: 'TOKEN_EXPIRED'
            });
            return;
        }

        if (error.name === 'JsonWebTokenError') {
            res.status(401).json({
                success: false,
                message: 'Invalid authentication token. Please login again.',
                code: 'INVALID_TOKEN'
            });
            return;
        }

        if (error.name === 'NotBeforeError') {
            res.status(401).json({
                success: false,
                message: 'Token not yet valid. Please check your system time.',
                code: 'TOKEN_NOT_ACTIVE'
            });
            return;
        }

        // Generic authentication error
        res.status(401).json({
            success: false,
            message: 'Authentication failed. Please login again.',
            code: 'AUTH_FAILED'
        });
    }
};
