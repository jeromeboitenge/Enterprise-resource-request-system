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
import { createDepartmentSchema, updateDepartmentSchema } from '../validator/department.validation';
import { Roles } from '../types/user.interface';

const router = Router();

router.use(authenticate);

router.post(
    '/',
    authorize(Roles.ADMIN),
    validate(createDepartmentSchema),
    createDepartment
);

router.get('/', getAllDepartments);

router.get('/:id', getDepartment);

router.put(
    '/:id',
    authorize(Roles.ADMIN),
    validate(updateDepartmentSchema),
    updateDepartment
);

router.delete('/:id', authorize(Roles.ADMIN), deleteDepartment);

export default router;
