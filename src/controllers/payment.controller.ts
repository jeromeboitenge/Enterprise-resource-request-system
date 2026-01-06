import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { RequestStatus } from '../types/request.interface';

export const processPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { requestId } = req.params;
        const { amountPaid, paymentMethod } = req.body;

        const request = await prisma.request.findUnique({
            where: { id: requestId },
            include: {
                user: { select: { name: true, email: true } },
                department: { select: { name: true } }
            }
        });

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

        const existingPayment = await prisma.payment.findUnique({
            where: { requestId }
        });

        if (existingPayment) {
            return res.status(409).json({
                success: false,
                message: 'Payment already processed for this request'
            });
        }


        if (Number(amountPaid) > Number(request.estimatedCost)) {
            return res.status(400).json({
                success: false,
                message: 'Payment amount cannot exceed estimated cost'
            });
        }

        const payment = await prisma.payment.create({
            data: {
                requestId,
                financeOfficerId: req.user.id,
                amountPaid: Number(amountPaid),
                paymentMethod
            }
        });

        const updatedRequest = await prisma.request.update({
            where: { id: requestId },
            data: { status: RequestStatus.Funded }
        });

        const paymentWithOfficer = await prisma.payment.findUnique({
            where: { id: payment.id },
            include: { financeOfficer: { select: { name: true, email: true, role: true } } }
        });

        res.status(201).json({
            success: true,
            message: 'Payment processed successfully',
            data: {
                payment: paymentWithOfficer,
                request: updatedRequest
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
            filter.paymentMethod = paymentMethod as string;
        }

        if (startDate || endDate) {
            filter.paymentDate = {};
            if (startDate) {
                filter.paymentDate.gte = new Date(startDate as string);
            }
            if (endDate) {
                filter.paymentDate.lte = new Date(endDate as string);
            }
        }

        const payments = await prisma.payment.findMany({
            where: filter,
            include: {
                request: true,
                financeOfficer: { select: { name: true, email: true, role: true } }
            },
            orderBy: { paymentDate: 'desc' }
        });

        const totalAmount = payments.reduce((sum, payment) => sum + Number(payment.amountPaid), 0);

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
        const payment = await prisma.payment.findUnique({
            where: { id: req.params.id },
            include: {
                request: {
                    include: {
                        user: { select: { name: true, email: true, department: true } },
                        department: { select: { name: true } }
                    }
                },
                financeOfficer: { select: { name: true, email: true, role: true } }
            }
        });

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
        const requests = await prisma.request.findMany({
            where: { status: RequestStatus.Approved as any },
            include: {
                user: { select: { name: true, email: true, role: true, department: true } },
                department: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        const totalEstimatedCost = requests.reduce((sum, req) => sum + Number(req.estimatedCost), 0);

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
