import { Router } from 'express';
import {
    approveRequest,
    rejectRequest,
    getApprovalHistory,
    getPendingApprovals
} from '../controllers/approval.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';
import { validate } from '../middleware/validate';
import { approvalDecisionSchema } from '../schema/approval.validation';
import { Roles } from '../types/user.interface';

const router = Router();

router.use(authenticate);


router.get('/pending', authorize(Roles.Manager, Roles.DepartmentHead, Roles.Admin), getPendingApprovals);


router.post(
    '/:requestId/approve',
    authorize(Roles.Manager, Roles.Admin),
    validate(approvalDecisionSchema),
    approveRequest
);


router.post(
    '/:requestId/reject',
    authorize(Roles.Manager, Roles.Admin),
    validate(approvalDecisionSchema),
    rejectRequest
);


router.get('/:requestId', getApprovalHistory);

export default router;
