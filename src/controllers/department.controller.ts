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

        // Step 3: Create department in database
        const department = await Department.create({ name, description });

        // Step 4: Send success response
        res.status(201).json({
            success: true,
            message: 'Department created successfully',
            data: { department }
        });

    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};

/**
 * ============================================
 * GET ALL DEPARTMENTS
 * ============================================
 * 
 * This function gets all departments.
 * Any authenticated user can view departments.
 * 
 * Steps:
 * 1. Find all departments in database
 * 2. Send response with departments list
 */
export const getAllDepartments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Step 1: Find all departments, sorted by name
        const departments = await Department.find().sort({ name: 1 });

        // Step 2: Send response
        res.status(200).json({
            success: true,
            message: 'Departments retrieved successfully',
            data: {
                count: departments.length,
                departments
            }
        });

    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};

/**
 * ============================================
 * GET SINGLE DEPARTMENT
 * ============================================
 * 
 * This function gets a single department by ID.
 * Any authenticated user can view a department.
 * 
 * Steps:
 * 1. Get department ID from URL
 * 2. Find department in database
 * 3. Send response with department data
 */
export const getDepartment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Step 1: Find department by ID
        const department = await Department.findById(req.params.id);

        // Step 2: Check if department exists
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        // Step 3: Send response
        res.status(200).json({
            success: true,
            message: 'Department retrieved successfully',
            data: { department }
        });

    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};

/**
 * ============================================
 * UPDATE DEPARTMENT
 * ============================================
 * 
 * This function updates a department.
 * Only admin users can update departments.
 * 
 * Steps:
 * 1. Get department ID and update data
 * 2. Check if new name conflicts with existing department
 * 3. Update department in database
 * 4. Send response with updated department
 */
export const updateDepartment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Step 1: Get update data from body
        const { name, description } = req.body;

        // Step 2: If name is being changed, check if it's already taken
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

        // Step 3: Update department in database
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
