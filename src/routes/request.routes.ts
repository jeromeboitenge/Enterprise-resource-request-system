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

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/requests
 * @desc    Create a new resource request
 * @access  Private (All authenticated users)
 */
router.post('/', validate(createRequestSchema), createRequest);

/**
 * @route   GET /api/v1/requests/my
 * @desc    Get requests created by current user
 * @access  Private
 */
router.get('/my', getMyRequests);

/**
 * @route   GET /api/v1/requests
 * @desc    Get all requests (for managers and finance)
 * @access  Private (Manager, Finance, Admin)
 */
router.get(
    '/',
    authorize(Roles.Manager, Roles.Finance, Roles.Admin),
    getAllRequests
);

/**
 * @route   GET /api/v1/requests/:id
 * @desc    Get single request
 * @access  Private
 */
router.get('/:id', getRequest);

/**
 * @route   PUT /api/v1/requests/:id
 * @desc    Update request (only if pending)
 * @access  Private (Request owner only)
 */
router.put('/:id', validate(createRequestSchema), updateRequest);

/**
 * @route   DELETE /api/v1/requests/:id
 * @desc    Delete request (only if pending)
 * @access  Private (Request owner only)
 */
router.delete('/:id', deleteRequest);

export default router;
