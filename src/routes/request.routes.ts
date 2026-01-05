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
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';
import { validate } from '../middleware/validate';
import { createRequestSchema } from '../schema/request.validation';
import { Roles } from '../types/user.interface';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /requests:
 *   post:
 *     summary: Create a new resource request (draft)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - resourceName
 *               - resourceType
 *               - quantity
 *               - estimatedCost
 *               - departmentId
 *             properties:
 *               title:
 *                 type: string
 *                 example: New Laptop for Development
 *               resourceName:
 *                 type: string
 *                 example: Dell XPS 15
 *               resourceType:
 *                 type: string
 *                 example: Hardware
 *               description:
 *                 type: string
 *                 example: Need a new laptop for software development work
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *                 example: 1
 *               estimatedCost:
 *                 type: number
 *                 minimum: 0
 *                 example: 1500
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 example: high
 *               departmentId:
 *                 type: string
 *                 example: 65f9876543210abcdef98765
 *     responses:
 *       201:
 *         description: Request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Request created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     request:
 *                       $ref: '#/components/schemas/Request'
 */
router.post('/', validate(createRequestSchema), createRequest);

/**
 * @swagger
 * /requests/my:
 *   get:
 *     summary: Get my requests
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, submitted, under_review, approved, rejected, funded, fulfilled, cancelled]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
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
 */
router.get('/my', getMyRequests);

/**
 * @swagger
 * /requests/department:
 *   get:
 *     summary: Get department requests (Department Head only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Department requests retrieved successfully
 *       403:
 *         description: Access denied - Department Head role required
 */
router.get('/department', authorize(Roles.DepartmentHead, Roles.Admin), getDepartmentRequests);

/**
 * @swagger
 * /requests:
 *   get:
 *     summary: Get all requests (Manager/Finance/Admin only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *         description: Filter by department
 *     responses:
 *       200:
 *         description: All requests retrieved successfully
 *       403:
 *         description: Access denied - Manager/Finance/Admin role required
 */
router.get(
    '/',
    authorize(Roles.Manager, Roles.Finance, Roles.Admin),
    getAllRequests
);

/**
 * @swagger
 * /requests/{id}:
 *   get:
 *     summary: Get a specific request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID
 *     responses:
 *       200:
 *         description: Request retrieved successfully
 *       404:
 *         description: Request not found
 */
router.get('/:id', getRequest);

/**
 * @swagger
 * /requests/{id}:
 *   put:
 *     summary: Update a request (draft/submitted only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Request'
 *     responses:
 *       200:
 *         description: Request updated successfully
 *       403:
 *         description: Cannot update request in current status
 */
router.put('/:id', validate(createRequestSchema), updateRequest);

/**
 * @swagger
 * /requests/{id}:
 *   delete:
 *     summary: Delete a request (draft/submitted only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID
 *     responses:
 *       200:
 *         description: Request deleted successfully
 *       403:
 *         description: Cannot delete request in current status
 */
router.delete('/:id', deleteRequest);

/**
 * @swagger
 * /requests/{id}/submit:
 *   post:
 *     summary: Submit a draft request for approval
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID
 *     responses:
 *       200:
 *         description: Request submitted successfully
 *       400:
 *         description: Only draft requests can be submitted
 */
router.post('/:id/submit', submitRequest);

/**
 * @swagger
 * /requests/{id}/cancel:
 *   post:
 *     summary: Cancel a request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID
 *     responses:
 *       200:
 *         description: Request cancelled successfully
 *       400:
 *         description: Cannot cancel request in current status
 */
router.post('/:id/cancel', cancelRequest);

export default router;
