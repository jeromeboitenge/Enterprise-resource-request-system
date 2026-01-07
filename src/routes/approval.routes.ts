import { Router } from 'express';
import {
    approveRequest,
    rejectRequest,
    getApprovalHistory,
    getPendingApprovals
} from '../controllers/approval.controller';
import { authenticate } from '../auth/auth.middleware';
import { authorize } from '../auth/authorize.middleware';
import { validate } from '../middleware/validate';
import { approvalDecisionSchema } from '../validator/approval.validation';
import { Roles } from '../types/user.interface';

const router = Router();

router.use(authenticate);


router.get('/pending', authorize(Roles.MANAGER, Roles.ADMIN), getPendingApprovals);


router.post(
    '/:requestId/approve',
    authorize(Roles.MANAGER, Roles.ADMIN),
    validate(approvalDecisionSchema),
    approveRequest
);


router.post(
    '/:requestId/reject',
    authorize(Roles.MANAGER, Roles.ADMIN),
    validate(approvalDecisionSchema),
    rejectRequest
);


router.get('/:requestId', getApprovalHistory);

export default router;
