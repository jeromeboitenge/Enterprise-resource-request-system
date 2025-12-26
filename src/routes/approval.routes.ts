import { Router } from 'express';
import {
    approveRequest,
    rejectRequest,
    getApprovalHistory
} from '../controllers/approval.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';
import { validate } from '../middleware/validate';
import { approvalDecisionSchema } from '../schema/approval.validation';
import { Roles } from '../types/user.interface';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/approvals/:requestId/approve
 * @desc    Approve a request
 * @access  Private (Manager only)
 */
router.post(
    '/:requestId/approve',
    authorize(Roles.Manager, Roles.Admin),
    validate(approvalDecisionSchema),
    approveRequest
);

/**
 * @route   POST /api/v1/approvals/:requestId/reject
 * @desc    Reject a request
 * @access  Private (Manager only)
 */
router.post(
    '/:requestId/reject',
    authorize(Roles.Manager, Roles.Admin),
    validate(approvalDecisionSchema),
    rejectRequest
);

/**
 * @route   GET /api/v1/approvals/:requestId
 * @desc    Get approval history for a request
 * @access  Private
 */
router.get('/:requestId', getApprovalHistory);

export default router;
