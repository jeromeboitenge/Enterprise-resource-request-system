import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { getPaginationParams, createPaginatedResponse } from '../utils/pagination';

export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { role, isActive, department } = req.query;
        const { page, limit, skip, take } = getPaginationParams(req.query);

        const filter: any = {};

        if (role) {
            filter.role = role as string;
        }

        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }

        if (department) {
            filter.department = department as string;
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where: filter,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    departmentId: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.user.count({ where: filter })
        ]);

        const paginatedResponse = createPaginatedResponse(
            users,
            total,
            page,
            limit
        );

        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: paginatedResponse
        });
    } catch (error) {
        next(error);
    }
};

export const getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                departmentId: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'User retrieved successfully',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, email, password, role, department, isActive } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }


        if (department) {
            const existingDept = await prisma.department.findUnique({
                where: { name: department }
            });

            if (!existingDept) {
                await prisma.department.create({
                    data: {
                        name: department,
                        description: `Automatically created for user ${email}`
                    }
                });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'employee',
                department,
                isActive: isActive !== undefined ? isActive : true
            }
        });

        const { password: _, ...userResponse } = user;

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: { user: userResponse }
        });
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, email, role, department, isActive } = req.body;

        if (email) {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser && existingUser.id !== req.params.id) {
                res.status(409).json({
                    success: false,
                    message: 'Email is already in use'
                });
            }
        }


        const userExists = await prisma.user.findUnique({ where: { id: req.params.id } });
        if (!userExists) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }


        if (department) {
            const existingDept = await prisma.department.findUnique({
                where: { name: department }
            });

            if (!existingDept) {
                await prisma.department.create({
                    data: {
                        name: department,
                        description: `Automatically created during update of user ${userExists!.email}`
                    }
                });
            }
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) updateData.role = role;
        if (department) updateData.department = department;
        if (isActive !== undefined) updateData.isActive = isActive;

        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: updateData
        });

        const { password, ...userWithoutPassword } = user;

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: { user: userWithoutPassword }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

        const userExists = await prisma.user.findUnique({ where: { id: req.params.id } });

        if (!userExists) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = await prisma.user.delete({
            where: { id: req.params.id }
        });

        const { password, ...userWithoutPassword } = user;

        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
            data: { user: userWithoutPassword }
        });
    } catch (error) {
        next(error);
    }
};

export const resetUserPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { newPassword } = req.body;

        const userExists = await prisma.user.findUnique({ where: { id: req.params.id } });

        if (!userExists) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { password: hashedPassword }
        });

        const { password, ...userWithoutPassword } = user;

        res.status(200).json({
            success: true,
            message: 'Password reset successfully',
            data: { user: userWithoutPassword }
        });
    } catch (error) {
        next(error);
    }
};
