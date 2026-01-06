import { Router } from 'express';
import {
    createDepartment,
    getAllDepartments,
    getDepartment,
    updateDepartment,
    deleteDepartment
} from '../controllers/department.controller';
import { authenticate } from '../auth/auth.middleware';
import { authorize } from '../auth/authorize.middleware';
import { validate } from '../middleware/validate';
import { createDepartmentSchema, updateDepartmentSchema } from '../schema/department.validation';
import { Roles } from '../types/user.interface';

const router = Router();

router.use(authenticate);

router.post(
    '/',
    authorize(Roles.Admin),
    validate(createDepartmentSchema),
    createDepartment
);

router.get('/', getAllDepartments);

router.get('/:id', getDepartment);

router.put(
    '/:id',
    authorize(Roles.Admin),
    validate(updateDepartmentSchema),
    updateDepartment
);

router.delete('/:id', authorize(Roles.Admin), deleteDepartment);

export default router;
