import { Request, Response, NextFunction } from 'express';
import Department from '../model/department';
import { ApiError } from '../utils/ApiError';
import { responseService } from '../utils/ResponseService';
import { asyncHandler } from '../utils/asyncHandler';


export const createDepartment = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { name, description } = req.body;
        const existingDepartment = await Department.findOne({ name });
        if (existingDepartment) {
            throw ApiError.conflict('Department with this name already exists');
        }

        const department = await Department.create({ name, description });

        return responseService.response({
            res,
            data: { department },
            message: 'Department created successfully',
            statusCode: 201
        });
    }
);

/**
 * Get all departments
 * @route GET /api/v1/departments
 * @access Private
 */
export const getAllDepartments = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const departments = await Department.find().sort({ name: 1 });

        return responseService.response({
            res,
            data: {
                count: departments.length,
                departments
            },
            message: 'Departments retrieved successfully',
            statusCode: 200
        });
    }
);

/**
 * Get single department by ID
 * @route GET /api/v1/departments/:id
 * @access Private
 */
export const getDepartment = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const department = await Department.findById(req.params.id);

        if (!department) {
            throw ApiError.notFound('Department not found');
        }

        return responseService.response({
            res,
            data: { department },
            message: 'Department retrieved successfully',
            statusCode: 200
        });
    }
);

/**
 * Update department
 * @route PUT /api/v1/departments/:id
 * @access Private (Admin only)
 */
export const updateDepartment = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { name, description } = req.body;

        // Check if new name conflicts with existing department
        if (name) {
            const existingDepartment = await Department.findOne({
                name,
                _id: { $ne: req.params.id }
            });
            if (existingDepartment) {
                throw ApiError.conflict('Department with this name already exists');
            }
        }

        const department = await Department.findByIdAndUpdate(
            req.params.id,
            { name, description },
            { new: true, runValidators: true }
        );

        if (!department) {
            throw ApiError.notFound('Department not found');
        }

        return responseService.response({
            res,
            data: { department },
            message: 'Department updated successfully',
            statusCode: 200
        });
    }
);

/**
 * Delete department
 * @route DELETE /api/v1/departments/:id
 * @access Private (Admin only)
 */
export const deleteDepartment = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const department = await Department.findByIdAndDelete(req.params.id);

        if (!department) {
            throw ApiError.notFound('Department not found');
        }

        return responseService.response({
            res,
            data: { department },
            message: 'Department deleted successfully',
            statusCode: 200
        });
    }
);
