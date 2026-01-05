import { Request, Response, NextFunction } from 'express';
import Department from '../model/department';

export const createDepartment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description } = req.body;
        const existingDepartment = await Department.findOne({ name });
        if (existingDepartment) {
            return res.status(409).json({
                success: false,
                message: 'Department with this name already exists'
            });
        }

        const department = await Department.create({ name, description });

        res.status(201).json({
            success: true,
            message: 'Department created successfully',
            data: { department }
        });

    } catch (error) {

        next(error);
    }
};

export const getAllDepartments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const departments = await Department.find().sort({ name: 1 });

        res.status(200).json({
            success: true,
            message: 'Departments retrieved successfully',
            data: {
                count: departments.length,
                departments
            }
        });

    } catch (error) {
        next(error);
    }
};

export const getDepartment = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({
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

export const updateDepartment = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { name, description } = req.body;

        if (name) {
            const existingDepartment = await Department.findOne({
                name,
                _id: { $ne: req.params.id } // Exclude current department
            });

            if (existingDepartment) {
                return res.status(409).json({
                    success: false,
                    message: 'Department with this name already exists'
                });
            }
        }

        const department = await Department.findByIdAndUpdate(
            req.params.id,
            { name, description },
            { new: true, runValidators: true } // Return updated doc and run validation
        );

        // Check if department was found
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        // Step 4: Send response
        res.status(200).json({
            success: true,
            message: 'Department updated successfully',
            data: { department }
        });

    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};

/**
 * ============================================
 * DELETE DEPARTMENT
 * ============================================
 * 
 * This function deletes a department.
 * Only admin users can delete departments.
 * 
 * Steps:
 * 1. Get department ID from URL
 * 2. Delete department from database
 * 3. Send success response
 */
export const deleteDepartment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Step 1: Delete department by ID
        const department = await Department.findByIdAndDelete(req.params.id);

        // Step 2: Check if department was found
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        // Step 3: Send success response
        res.status(200).json({
            success: true,
            message: 'Department deleted successfully',
            data: { department }
        });

    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};
