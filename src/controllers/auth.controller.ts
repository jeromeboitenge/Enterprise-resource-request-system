import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
// import User from '../model/user'; // Removed Mongoose model

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password, role, department } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const userDepartment = department || 'IT';

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'employee',
                department: userDepartment
            }
        });

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '1d' }
        );

        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            isActive: user.isActive,
            createdAt: user.createdAt
        };

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: userResponse,
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Please contact administrator.'
            });
        }

        // To track lastLogin we might need to add that field to schema or just ignore for now if not in schema.
        // The schema created has 'createdAt' and 'updatedAt'. Let's check schema.
        // Schema doesn't have lastLogin. It has failedLoginAttempts.
        // We can ignore updating lastLogin for now unless we add it to schema.

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '1d' }
        );

        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            isActive: user.isActive
        };

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: userResponse,
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Exclude password manually since Prisma doesn't have built-in exclusion yet like Mongoose select
        const { password, ...userWithoutPassword } = user;

        res.status(200).json({
            success: true,
            message: 'Profile retrieved successfully',
            data: { user: userWithoutPassword }
        });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email } = req.body;

        if (email && email !== req.user.email) {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Email is already in use'
                });
            }
        }

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { name, email }
        });

        const { password, ...userWithoutPassword } = user;

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: { user: userWithoutPassword }
        });
    } catch (error) {
        next(error);
    }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await prisma.user.findUnique({ where: { id: req.user.id } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: 'New password must be different from current password'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
            data: {}
        });
    } catch (error) {
        next(error);
    }
};
