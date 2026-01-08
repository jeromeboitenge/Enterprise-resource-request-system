import prisma from '../lib/prisma';
import { RequestStatus } from '../types/request.interface';
import { getPaymentInclude } from '../utils/queryHelpers';

export class PaymentService {

    static validatePayment(request: any, amountPaid: number): {
        valid: boolean;
        message?: string;
    } {
        if (request.status !== RequestStatus.APPROVED) {
            return {
                valid: false,
                message: 'Only approved requests can be paid'
            };
        }

        if (Number(amountPaid) > Number(request.estimatedCost)) {
            return {
                valid: false,
                message: 'Payment amount cannot exceed estimated cost'
            };
        }

        return { valid: true };
    }

    static async checkPaymentExists(requestId: string) {
        return await prisma.payment.findUnique({
            where: { requestId }
        });
    }

    static async processPayment(
        requestId: string,
        financeOfficerId: string,
        amountPaid: number,
        paymentMethod: string
    ) {
        // Create payment record
        const payment = await prisma.payment.create({
            data: {
                requestId,
                financeOfficerId,
                amountPaid: Number(amountPaid),
                paymentMethod
            }
        });

        // Update request status to PAID
        const updatedRequest = await prisma.request.update({
            where: { id: requestId },
            data: { status: RequestStatus.PAID }
        });

        // Get payment with finance officer details
        const paymentWithOfficer = await prisma.payment.findUnique({
            where: { id: payment.id },
            include: { financeOfficer: { select: { name: true, email: true, role: true } } }
        });

        return {
            payment: paymentWithOfficer,
            request: updatedRequest
        };
    }

    static async getPaymentHistory(
        filters: {
            paymentMethod?: string;
            startDate?: Date;
            endDate?: Date;
        },
        pagination: { skip: number; take: number }
    ) {
        const { skip, take } = pagination;
        const filter: any = {};

        if (filters.paymentMethod) {
            filter.paymentMethod = filters.paymentMethod;
        }

        if (filters.startDate || filters.endDate) {
            filter.paymentDate = {};
            if (filters.startDate) {
                filter.paymentDate.gte = filters.startDate;
            }
            if (filters.endDate) {
                filter.paymentDate.lte = filters.endDate;
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

        return { payments, total };
    }

    static async getPaymentById(id: string) {
        return await prisma.payment.findUnique({
            where: { id },
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
    }

    static async getPendingPayments(pagination: { skip: number; take: number }) {
        const { skip, take } = pagination;

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

        return { requests, total };
    }

    static calculateTotalAmount(payments: any[]): number {
        return payments.reduce((sum, payment) => sum + Number(payment.amountPaid), 0);
    }

    static calculateTotalEstimatedCost(requests: any[]): number {
        return requests.reduce((sum, req) => sum + Number(req.estimatedCost), 0);
    }
}
