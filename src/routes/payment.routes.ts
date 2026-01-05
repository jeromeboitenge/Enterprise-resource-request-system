import { Router } from 'express';
import {
    processPayment,
    getPaymentHistory,
    getPayment,
    getPendingPayments
} from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';
import { validate } from '../middleware/validate';
import { processPaymentSchema } from '../schema/payment.validation';
import { Roles } from '../types/user.interface';

const router = Router();

router.use(authenticate);
router.use(authorize(Roles.Finance, Roles.Admin));

/**
 * @swagger
 * /payments/pending:
 *   get:
 *     summary: Get pending payments (Finance/Admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending payments retrieved successfully
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
 *                     totalEstimatedCost:
 *                       type: number
 *                     requests:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Request'
 *       403:
 *         description: Access denied - Finance role required
 */
router.get('/pending', getPendingPayments);

/**
 * @swagger
 * /payments/{requestId}:
 *   post:
 *     summary: Process payment for approved request (Finance/Admin only)
 *     tags: [Payments]
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amountPaid
 *               - paymentMethod
 *             properties:
 *               amountPaid:
 *                 type: number
 *                 minimum: 0
 *                 example: 1500
 *               paymentMethod:
 *                 type: string
 *                 enum: [bank_transfer, check, cash, credit_card]
 *                 example: bank_transfer
 *     responses:
 *       201:
 *         description: Payment processed successfully
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
 *                     payment:
 *                       $ref: '#/components/schemas/Payment'
 *                     request:
 *                       $ref: '#/components/schemas/Request'
 *       400:
 *         description: Request not approved or payment already processed
 *       403:
 *         description: Access denied
 */
router.post(
    '/:requestId',
    validate(processPaymentSchema),
    processPayment
);

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Get payment history (Finance/Admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *           enum: [bank_transfer, check, cash, credit_card]
 *         description: Filter by payment method
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
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
 *                     totalAmount:
 *                       type: number
 *                     payments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Payment'
 */
router.get('/', getPaymentHistory);

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Get a specific payment (Finance/Admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment retrieved successfully
 *       404:
 *         description: Payment not found
 */
router.get('/:id', getPayment);

export default router;
