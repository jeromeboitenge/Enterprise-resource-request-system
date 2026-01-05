import { Request, Response, NextFunction } from 'express';
import ResourceRequest from '../model/request';
import Payment from '../model/payment';
import { RequestStatus } from '../types/request.interface';

export const processPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { requestId } = req.params;
        const { amountPaid, paymentMethod } = req.body;

        const request = await ResourceRequest.findById(requestId)
            .populate('userId', 'name email')
            .populate('departmentId', 'name');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        if (request.status !== RequestStatus.Approved) {
            return res.status(400).json({
                success: false,
                message: 'Only approved requests can be paid'
            });
        }

        const existingPayment = await Payment.findOne({ requestId });
        if (existingPayment) {
            return res.status(409).json({
                success: false,
                message: 'Payment already processed for this request'
            });
        }

        if (amountPaid > request.estimatedCost) {
            return res.status(400).json({
                success: false,
                message: 'Payment amount cannot exceed estimated cost'
            });
        }

        const payment = await Payment.create({
            requestId,
            financeOfficerId: req.user._id,
            amountPaid,
            paymentMethod
        });

        request.status = RequestStatus.Funded;
        await request.save();

        await payment.populate('financeOfficerId', 'name email role');

        res.status(201).json({
            success: true,
            message: 'Payment processed successfully',
            data: {
                payment,
                request
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getPaymentHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
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

        const totalAmount = payments.reduce((sum, payment) => sum + payment.amountPaid, 0);

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
        next(error);
    }
};

export const getPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
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
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
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

export const getPendingPayments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const requests = await ResourceRequest.find({ status: RequestStatus.Approved })
            .populate('userId', 'name email role department')
            .populate('departmentId', 'name')
            .sort({ createdAt: -1 });

        const totalEstimatedCost = requests.reduce((sum, req) => sum + req.estimatedCost, 0);

        res.status(200).json({
            success: true,
            message: 'Pending payments retrieved successfully',
            data: {
                count: requests.length,
                totalEstimatedCost,
                requests
            }
        });
    } catch (error) {
        next(error);
    }
};
