import { Router } from 'express';
import {
    createRequest,
    getMyRequests,
    getAllRequests,
    getRequest,
    updateRequest,
    deleteRequest,
    submitRequest,
    cancelRequest,
    getDepartmentRequests
} from '../controllers/request.controller';
import { authenticate } from '../auth/auth.middleware';
import { authorize } from '../auth/authorize.middleware';
import { validate } from '../middleware/validate';
import { createRequestSchema, updateRequestSchema } from '../schema/request.validation';
import { Roles } from '../types/user.interface';

const router = Router();

router.use(authenticate);


router.post('/', validate(createRequestSchema), createRequest);


router.get('/my', getMyRequests);


router.get('/department', authorize(Roles.DepartmentHead, Roles.Admin), getDepartmentRequests);


router.get(
    '/',
    authorize(Roles.Manager, Roles.Finance, Roles.Admin),
    getAllRequests
);


router.get('/:id', getRequest);


router.put('/:id', validate(updateRequestSchema), updateRequest);


router.delete('/:id', deleteRequest);


router.post('/:id/submit', submitRequest);


router.post('/:id/cancel', cancelRequest);

export default router;
