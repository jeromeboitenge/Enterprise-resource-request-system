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

/**
 * @swagger
 * /approvals/pending:
 *   get:
 *     summary: Get pending approvals (Manager/Department Head/Admin only)
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending approvals retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: number
 *                     requests:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Request'
 *       403:
 *         description: Access denied
 */
router.get('/pending', authorize(Roles.Manager, Roles.DepartmentHead, Roles.Admin), getPendingApprovals);

/**
 * @swagger
 * /approvals/{requestId}/approve:
 *   post:
 *     summary: Approve a request (Manager/Admin only)
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 example: Approved for business needs
 *     responses:
 *       200:
 *         description: Request approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     request:
 *                       $ref: '#/components/schemas/Request'
 *                     approval:
 *                       $ref: '#/components/schemas/Approval'
 *       400:
 *         description: Request not in submitted status
 *       403:
 *         description: Access denied
 */
router.post(
    '/:requestId/approve',
    authorize(Roles.Manager, Roles.Admin),
    validate(approvalDecisionSchema),
    approveRequest
);

/**
 * @swagger
 * /approvals/{requestId}/reject:
 *   post:
 *     summary: Reject a request (Manager/Admin only)
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 example: Budget constraints
 *     responses:
 *       200:
 *         description: Request rejected successfully
 *       400:
 *         description: Request not in submitted status
 *       403:
 *         description: Access denied
 */
router.post(
    '/:requestId/reject',
    authorize(Roles.Manager, Roles.Admin),
    validate(approvalDecisionSchema),
    rejectRequest
);

/**
 * @swagger
 * /approvals/{requestId}:
 *   get:
 *     summary: Get approval history for a request
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID
 *     responses:
 *       200:
 *         description: Approval history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: number
 *                     approvals:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Approval'
 */
router.get('/:requestId', getApprovalHistory);

export default router;
