import { Router } from 'express';
import {
    processPayment,
    getPaymentHistory,
    getPayment
} from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';
import { validate } from '../middleware/validate';
import { processPaymentSchema } from '../schema/payment.validation';
import { Roles } from '../types/user.interface';

const router = Router();

// All routes require authentication and finance/admin role
router.use(authenticate);
router.use(authorize(Roles.Finance, Roles.Admin));

/**
 * @route   POST /api/v1/payments/:requestId
 * @desc    Process payment for an approved request
 * @access  Private (Finance only)
 */
router.post(
    '/:requestId',
    validate(processPaymentSchema),
    processPayment
);

/**
 * @route   GET /api/v1/payments
 * @desc    Get all payments
 * @access  Private (Finance, Admin)
 */
router.get('/', getPaymentHistory);

/**
 * @route   GET /api/v1/payments/:id
 * @desc    Get single payment
 * @access  Private (Finance, Admin)
 */
router.get('/:id', getPayment);

export default router;
