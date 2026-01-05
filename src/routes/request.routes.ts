import { Router } from 'express';
import {
    createRequest,
    getMyRequests,
    getAllRequests,
    getRequest,
    updateRequest,
    deleteRequest
} from '../controllers/request.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';
import { validate } from '../middleware/validate';
import { createRequestSchema } from '../schema/request.validation';
import { Roles } from '../types/user.interface';

const router = Router();

router.use(authenticate);

router.post('/', validate(createRequestSchema), createRequest);

router.get('/my', getMyRequests);

router.get(
    '/',
    authorize(Roles.Manager, Roles.Finance, Roles.Admin),
    getAllRequests
);

router.get('/:id', getRequest);

router.put('/:id', validate(createRequestSchema), updateRequest);

router.delete('/:id', deleteRequest);

export default router;
