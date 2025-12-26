import { Request, Response, NextFunction } from 'express';
import Department from '../model/department';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Create a new department
 * @route POST /api/v1/departments
 * @access Private (Admin only)
 */
export const createDepartment = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { name, description } = req.body;

        // Check if department already exists
        const existingDepartment = await Department.findOne({ name });
        if (existingDepartment) {
            throw ApiError.conflict('Department with this name already exists');
        }

        const department = await Department.create({ name, description });

        ApiResponse.created('Department created successfully', { department }).send(res);
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

        ApiResponse.success('Departments retrieved successfully', {
            count: departments.length,
            departments
        }).send(res);
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

        ApiResponse.success('Department retrieved successfully', { department }).send(res);
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

        ApiResponse.success('Department updated successfully', { department }).send(res);
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

        ApiResponse.success('Department deleted successfully', { department }).send(res);
    }
);
