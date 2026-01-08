import { Request, Response, NextFunction } from 'express';
import { DepartmentService } from '../services/department.service';
import { getPaginationParams, createPaginatedResponse } from '../utils/pagination';

export const createDepartment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, description } = req.body;

        const exists = await DepartmentService.checkDepartmentExists(name);

        if (exists) {
            res.status(409).json({
                success: false,
                message: 'Department with this name already exists'
            });
            return;
        }

        const department = await DepartmentService.createDepartment(
            { name, description },
            req.user.id
        );

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

        const { departments, total } = await DepartmentService.getAllDepartments({ skip, take });

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
        const department = await DepartmentService.getDepartmentById(req.params.id);

        if (!department) {
            res.status(404).json({
                success: false,
                message: 'Department not found'
            });
            return;
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
            const exists = await DepartmentService.checkDepartmentExists(name, req.params.id);

            if (exists) {
                res.status(409).json({
                    success: false,
                    message: 'Department with this name already exists'
                });
                return;
            }
        }

        const deptExists = await DepartmentService.getDepartmentById(req.params.id);
        if (!deptExists) {
            res.status(404).json({
                success: false,
                message: 'Department not found'
            });
            return;
        }

        const department = await DepartmentService.updateDepartment(req.params.id, { name, description });

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
        const deptExists = await DepartmentService.getDepartmentById(req.params.id);

        if (!deptExists) {
            res.status(404).json({
                success: false,
                message: 'Department not found'
            });
            return;
        }

        const department = await DepartmentService.deleteDepartment(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Department deleted successfully',
            data: { department }
        });
    } catch (error) {
        next(error);
    }
};
