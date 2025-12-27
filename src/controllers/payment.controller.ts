import { Request, Response, NextFunction } from 'express';
import ResourceRequest from '../model/request';
import Payment from '../model/payment';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { RequestStatus } from '../types/request.interface';

/**
 * Process payment for an approved request
 * @route POST /api/v1/payments/:requestId
 * @access Private (Finance only)
 */
export const processPayment = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { requestId } = req.params;
        const { amountPaid, paymentMethod } = req.body;

        // Find the request
        const request = await ResourceRequest.findById(requestId)
            .populate('userId', 'name email')
            .populate('departmentId', 'name');

        if (!request) {
            throw ApiError.notFound('Request not found');
        }

        // Check if request is approved
        if (request.status !== RequestStatus.Approved) {
            throw ApiError.badRequest(
                'Only approved requests can be paid'
            );
        }

        // Check if payment already exists
        const existingPayment = await Payment.findOne({ requestId });
        if (existingPayment) {
            throw ApiError.conflict('Payment already processed for this request');
        }

        // Validate amount
        if (amountPaid > request.estimatedCost) {
            throw ApiError.badRequest(
                'Payment amount cannot exceed estimated cost'
            );
        }

        // Create payment record
        const payment = await Payment.create({
            requestId,
            financeOfficerId: req.user._id,
            amountPaid,
            paymentMethod
        });

        // Update request status to funded
        request.status = RequestStatus.Funded;
        await request.save();

        await payment.populate('financeOfficerId', 'name email role');

        ApiResponse.created('Payment processed successfully', {
            payment,
            request
        }).send(res);
    }
);

/**
 * Get all payments
 * @route GET /api/v1/payments
 * @access Private (Finance, Admin)
 */
export const getPaymentHistory = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { paymentMethod, startDate, endDate } = req.query;

        const filter: any = {};

        if (paymentMethod) {
            filter.paymentMethod = paymentMethod;
        }

        if (startDate || endDate) {
            filter.paymentDate = {};
            if (startDate) {
                filter.paymentDate.$gte = new Date(startDate as string);
            }
            if (endDate) {
                filter.paymentDate.$lte = new Date(endDate as string);
            }
        }

        const payments = await Payment.find(filter)
            .populate('requestId')
            .populate('financeOfficerId', 'name email role')
            .sort({ paymentDate: -1 });

        // Calculate total amount paid
        const totalAmount = payments.reduce((sum, payment) => sum + payment.amountPaid, 0);

        ApiResponse.success('Payment history retrieved successfully', {
            count: payments.length,
            totalAmount,
            payments
        }).send(res);
    }
);

/**
 * Get single payment by ID
 * @route GET /api/v1/payments/:id
 * @access Private (Finance, Admin)
 */
export const getPayment = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const payment = await Payment.findById(req.params.id)
            .populate({
                path: 'requestId',
                populate: [
                    { path: 'userId', select: 'name email department' },
                    { path: 'departmentId', select: 'name' }
                ]
            })
            .populate('financeOfficerId', 'name email role');

        if (!payment) {
            throw ApiError.notFound('Payment not found');
        }

        ApiResponse.success('Payment retrieved successfully', { payment }).send(res);
    }
);
