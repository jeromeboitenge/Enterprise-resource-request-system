import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { RequestStatus } from '../types/request.interface';
import { getPaginationParams, createPaginatedResponse } from '../utils/pagination';
import { getPaymentInclude } from '../utils/queryHelpers';

export const processPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
            res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        if (request!.status !== RequestStatus.APPROVED) {
            res.status(400).json({
                success: false,
                message: 'Only approved requests can be paid'
            });
        }

        const existingPayment = await prisma.payment.findUnique({
            where: { requestId }
        });

        if (existingPayment) {
            res.status(409).json({
                success: false,
                message: 'Payment already processed for this request'
            });
        }


        if (Number(amountPaid) > Number(request!.estimatedCost)) {
            res.status(400).json({
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
            data: { status: RequestStatus.PAID }
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

export const getPaymentHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { paymentMethod, startDate, endDate } = req.query;
        const { page, limit, skip, take } = getPaginationParams(req.query);

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

        const [payments, total] = await Promise.all([
            prisma.payment.findMany({
                where: filter,
                include: getPaymentInclude(),
                orderBy: { paymentDate: 'desc' },
                skip,
                take
            }),
            prisma.payment.count({ where: filter })
        ]);

        const totalAmount = payments.reduce((sum, payment) => sum + Number(payment.amountPaid), 0);

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
            res.status(404).json({
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

export const getPendingPayments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { page, limit, skip, take } = getPaginationParams(req.query);

        const [requests, total] = await Promise.all([
            prisma.request.findMany({
                where: { status: RequestStatus.APPROVED },
                include: {
                    user: { select: { name: true, email: true, role: true, department: true } },
                    department: { select: { name: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.request.count({ where: { status: RequestStatus.APPROVED } })
        ]);

        const totalEstimatedCost = requests.reduce((sum, req) => sum + Number(req.estimatedCost), 0);

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
