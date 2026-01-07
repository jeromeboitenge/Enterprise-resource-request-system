import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { getPaginationParams, createPaginatedResponse } from '../utils/pagination';

export const createDepartment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, description } = req.body;

        const existingDepartment = await prisma.department.findUnique({
            where: { name }
        });

        if (existingDepartment) {
            res.status(409).json({
                success: false,
                message: 'Department with this name already exists'
            });
        }

        const department = await prisma.department.create({
            data: { name, description }
        });

        res.status(201).json({
            success: true,
            message: 'Department created successfully',
            data: { department }
        });
    } catch (error) {
        next(error);
    }
};

export const getAllDepartments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { page, limit, skip, take } = getPaginationParams(req.query);

        const [total, departments] = await Promise.all([
            prisma.department.count(),
            prisma.department.findMany({
                orderBy: { name: 'asc' },
                skip,
                take
            })
        ]);

        res.status(200).json({
            success: true,
            message: 'Departments retrieved successfully',
            data: createPaginatedResponse(departments, total, page, limit)
        });
    } catch (error) {
        next(error);
    }
};

export const getDepartment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const department = await prisma.department.findUnique({
            where: { id: req.params.id }
        });

        if (!department) {
            res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Department retrieved successfully',
            data: { department }
        });
    } catch (error) {
        next(error);
    }
};

export const updateDepartment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, description } = req.body;

        if (name) {
            const existingDepartment = await prisma.department.findUnique({ where: { name } });

            if (existingDepartment) {
                const isSameDepartment = existingDepartment.id === req.params.id;

                if (!isSameDepartment) {
                    res.status(409).json({
                        success: false,
                        message: 'Department with this name already exists'
                    });
                }
            }
        }

        const deptExists = await prisma.department.findUnique({ where: { id: req.params.id } });
        if (!deptExists) {
            res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (description) updateData.description = description;

        const department = await prisma.department.update({
            where: { id: req.params.id },
            data: updateData
        });

        res.status(200).json({
            success: true,
            message: 'Department updated successfully',
            data: { department }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteDepartment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const deptExists = await prisma.department.findUnique({ where: { id: req.params.id } });

        if (!deptExists) {
            res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        const department = await prisma.department.delete({
            where: { id: req.params.id }
        });

        res.status(200).json({
            success: true,
            message: 'Department deleted successfully',
            data: { department }
        });
    } catch (error) {
        next(error);
    }
};
