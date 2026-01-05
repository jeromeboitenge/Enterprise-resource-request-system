import { Request, Response, NextFunction } from 'express';
import ResourceRequest from '../model/request';
import Payment from '../model/payment';
import { RequestStatus } from '../types/request.interface';

/**
 * ============================================
 * PROCESS PAYMENT
 * ============================================
 * 
 * This function processes payment for an approved request.
 * Only finance team and admin can process payments.
 * 
 * Steps:
 * 1. Get request ID and payment details
 * 2. Find the request and verify it's approved
 * 3. Check if payment already exists
 * 4. Validate payment amount
 * 5. Create payment record
 * 6. Update request status to funded
 * 7. Send response
 */
export const processPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Step 1: Get request ID and payment details
        const { requestId } = req.params;
        const { amountPaid, paymentMethod } = req.body;

        // Step 2: Find the request and load related data
        const request = await ResourceRequest.findById(requestId)
            .populate('userId', 'name email')
            .populate('departmentId', 'name');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        // Check if request is approved
        if (request.status !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Only approved requests can be paid'
            });
        }

        // Step 3: Check if payment already exists for this request
        const existingPayment = await Payment.findOne({ requestId });
        if (existingPayment) {
            return res.status(409).json({
                success: false,
                message: 'Payment already processed for this request'
            });
        }

        // Step 4: Validate payment amount doesn't exceed estimated cost
        if (amountPaid > request.estimatedCost) {
            return res.status(400).json({
                success: false,
                message: 'Payment amount cannot exceed estimated cost'
            });
        }

        // Step 5: Create payment record in database
        const payment = await Payment.create({
            requestId,
            financeOfficerId: req.user._id,
            amountPaid,
            paymentMethod
        });

        // Step 6: Update request status to funded
        request.status = RequestStatus.Funded;
        await request.save();

        // Load finance officer details
        await payment.populate('financeOfficerId', 'name email role');

        // Step 7: Send success response
        res.status(201).json({
            success: true,
            message: 'Payment processed successfully',
            data: {
                payment,
                request
            }
        });

    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};

/**
 * ============================================
 * GET PAYMENT HISTORY
 * ============================================
 * 
 * This function gets all payments with optional filters.
 * Only finance team and admin can view payment history.
 * 
 * Steps:
 * 1. Get filter parameters from query
 * 2. Build filter object
 * 3. Find payments in database
 * 4. Calculate total amount paid
 * 5. Send response with payments
 */
export const getPaymentHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Step 1: Get filter parameters from query
        const { paymentMethod, startDate, endDate } = req.query;

        // Step 2: Build filter object
        const filter: any = {};

        // Add payment method filter if provided
        if (paymentMethod) {
            filter.paymentMethod = paymentMethod;
        }

        // Add date range filter if provided
        if (startDate || endDate) {
            filter.paymentDate = {};
            if (startDate) {
                filter.paymentDate.$gte = new Date(startDate as string);
            }
            if (endDate) {
                filter.paymentDate.$lte = new Date(endDate as string);
            }
        }

        // Step 3: Find payments and populate related data
        const payments = await Payment.find(filter)
            .populate('requestId')
            .populate('financeOfficerId', 'name email role')
            .sort({ paymentDate: -1 }); // Newest first

        // Step 4: Calculate total amount paid
        const totalAmount = payments.reduce((sum, payment) => sum + payment.amountPaid, 0);

        // Step 5: Send response
        res.status(200).json({
            success: true,
            message: 'Payment history retrieved successfully',
            data: {
                count: payments.length,
                totalAmount,
                payments
            }
        });

    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};

/**
 * ============================================
 * GET SINGLE PAYMENT
 * ============================================
 * 
 * This function gets a single payment by ID.
 * Only finance team and admin can view payment details.
 * 
 * Steps:
 * 1. Get payment ID from URL
 * 2. Find payment and populate all related data
 * 3. Send response with payment details
 */
export const getPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Step 1: Find payment by ID and populate related data
        const payment = await Payment.findById(req.params.id)
            .populate({
                path: 'requestId',
                populate: [
                    { path: 'userId', select: 'name email department' },
                    { path: 'departmentId', select: 'name' }
                ]
            })
            .populate('financeOfficerId', 'name email role');

        // Step 2: Check if payment exists
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Step 3: Send response
        res.status(200).json({
            success: true,
            message: 'Payment retrieved successfully',
            data: { payment }
        });

    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};
