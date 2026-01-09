import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';

export const assignManager = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { departmentId } = req.params;
        const { userId } = req.body;

        // Check if department exists
        const department = await prisma.department.findUnique({
            where: { id: departmentId }
        });

        if (!department) {
            res.status(404).json({
                success: false,
                message: 'Department not found'
            });
            return;
        }

        // Check if user exists and is a manager
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        if (user.role !== 'MANAGER') {
            res.status(400).json({
                success: false,
                message: 'User must have MANAGER role to be assigned as department manager'
            });
            return;
        }

        // Check if already assigned
        const existingAssignment = await prisma.departmentManager.findUnique({
            where: {
                userId_departmentId: {
                    userId,
                    departmentId
                }
            }
        });

        if (existingAssignment) {
            res.status(409).json({
                success: false,
                message: 'This user is already a manager of this department'
            });
            return;
        }

        // Create assignment
        const assignment = await prisma.departmentManager.create({
            data: {
                userId,
                departmentId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                },
                department: {
                    select: {
                        id: true,
                        name: true,
                        code: true
                    }
                }
            }
        });

        res.status(201).json({
            success: true,
            message: 'Manager assigned to department successfully',
            data: { assignment }
        });
    } catch (error) {
        next(error);
    }
};

export const removeManager = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { departmentId, userId } = req.params;

        // Check if assignment exists
        const assignment = await prisma.departmentManager.findUnique({
            where: {
                userId_departmentId: {
                    userId,
                    departmentId
                }
            },
            include: {
                user: { select: { name: true } },
                department: { select: { name: true } }
            }
        });

        if (!assignment) {
            res.status(404).json({
                success: false,
                message: 'Manager assignment not found'
            });
            return;
        }

        // Delete assignment
        await prisma.departmentManager.delete({
            where: {
                userId_departmentId: {
                    userId,
                    departmentId
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Manager removed from department successfully',
            data: { assignment }
        });
    } catch (error) {
        next(error);
    }
};

export const getDepartmentManagers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { departmentId } = req.params;

        // Check if department exists
        const department = await prisma.department.findUnique({
            where: { id: departmentId }
        });

        if (!department) {
            res.status(404).json({
                success: false,
                message: 'Department not found'
            });
            return;
        }

        // Get all managers for this department
        const managers = await prisma.departmentManager.findMany({
            where: { departmentId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        isActive: true
                    }
                }
            },
            orderBy: {
                assignedAt: 'desc'
            }
        });

        res.status(200).json({
            success: true,
            message: 'Department managers retrieved successfully',
            data: {
                department: {
                    id: department.id,
                    name: department.name
                },
                managers: managers.map(m => ({
                    ...m.user,
                    assignedAt: m.assignedAt
                }))
            }
        });
    } catch (error) {
        next(error);
    }
};
