import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { RequestService } from '../services/request.service';
import { getPaginationParams, createPaginatedResponse } from '../utils/pagination';

export const processPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { requestId } = req.params;
        const { amountPaid, paymentMethod } = req.body;

        const request = await RequestService.getRequestById(requestId);

        if (!request) {
            res.status(404).json({
                success: false,
                message: 'Request not found'
            });
            return;
        }

        const validation = PaymentService.validatePayment(request, amountPaid);

        if (!validation.valid) {
            res.status(400).json({
                success: false,
                message: validation.message
            });
            return;
        }

        const existingPayment = await PaymentService.checkPaymentExists(requestId);

        if (existingPayment) {
            res.status(409).json({
                success: false,
                message: 'Payment already processed for this request'
            });
            return;
        }

        const result = await PaymentService.processPayment(
            requestId,
            req.user.id,
            amountPaid,
            paymentMethod
        );

        res.status(201).json({
            success: true,
            message: 'Payment processed successfully',
            data: {
                payment: result.payment,
                request: result.request
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getPaymentHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { paymentMethod, startDate, endDate } = req.query;
        const { page, limit, skip, take } = getPaginationParams(req.query);

        const filters = {
            paymentMethod: paymentMethod as string | undefined,
            startDate: startDate ? new Date(startDate as string) : undefined,
            endDate: endDate ? new Date(endDate as string) : undefined
        };

        const { payments, total } = await PaymentService.getPaymentHistory(
            filters,
            { skip, take }
        );

        const totalAmount = PaymentService.calculateTotalAmount(payments);

        const paginatedResponse = createPaginatedResponse(
            payments,
            total,
            page,
            limit
        );

        res.status(200).json({
            success: true,
            message: 'Payment history retrieved successfully',
            data: {
                ...paginatedResponse,
                totalAmount
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const payment = await PaymentService.getPaymentById(req.params.id);

        if (!payment) {
            res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Payment retrieved successfully',
            data: { payment }
        });
    } catch (error) {
        next(error);
    }
};

export const getPendingPayments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { page, limit, skip, take } = getPaginationParams(req.query);

        const { requests, total } = await PaymentService.getPendingPayments({ skip, take });

        const totalEstimatedCost = PaymentService.calculateTotalEstimatedCost(requests);

        const paginatedResponse = createPaginatedResponse(
            requests,
            total,
            page,
            limit
        );

        res.status(200).json({
            success: true,
            message: 'Pending payments retrieved successfully',
            data: {
                ...paginatedResponse,
                totalEstimatedCost
            }
        });
    } catch (error) {
        next(error);
    }
};
