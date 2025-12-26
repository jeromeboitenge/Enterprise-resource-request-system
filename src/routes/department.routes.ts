import { Router } from 'express';
import {
    createDepartment,
    getAllDepartments,
    getDepartment,
    updateDepartment,
    deleteDepartment
} from '../controllers/department.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';
import { validate } from '../middleware/validate';
import { createDepartmentSchema } from '../schema/department.validation';
import { Roles } from '../types/user.interface';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/departments
 * @desc    Create a new department
 * @access  Private (Admin only)
 */
router.post(
    '/',
    authorize(Roles.Admin),
    validate(createDepartmentSchema),
    createDepartment
);

/**
 * @route   GET /api/v1/departments
 * @desc    Get all departments
 * @access  Private
 */
router.get('/', getAllDepartments);

/**
 * @route   GET /api/v1/departments/:id
 * @desc    Get single department
 * @access  Private
 */
router.get('/:id', getDepartment);

/**
 * @route   PUT /api/v1/departments/:id
 * @desc    Update department
 * @access  Private (Admin only)
 */
router.put(
    '/:id',
    authorize(Roles.Admin),
    validate(createDepartmentSchema),
    updateDepartment
);

/**
 * @route   DELETE /api/v1/departments/:id
 * @desc    Delete department
 * @access  Private (Admin only)
 */
router.delete('/:id', authorize(Roles.Admin), deleteDepartment);

export default router;
