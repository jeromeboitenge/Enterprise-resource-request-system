import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';


export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'No token provided. Please login first.'
            });
            return;
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found. Please contact administrator.'
            });
            return;
        }

        const { password, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;

        next();
    } catch (error: any) {
        if (error.name === 'JsonWebTokenError') {
            res.status(401).json({
                success: false,
                message: 'Invalid or expired token. Please login again.'
            });
            return;
        }

        if (error.name === 'TokenExpiredError') {
            res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }

        res.status(401).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};
