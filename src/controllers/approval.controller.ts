import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { RequestStatus } from '../types/request.interface';

export const approveRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { requestId } = req.params;
        const { comment } = req.body;

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

        if (request.status !== RequestStatus.Submitted) {
            return res.status(400).json({
                success: false,
                message: `Request has already been ${request.status}. Only submitted requests can be approved.`
            });
        }

        const approval = await prisma.approval.create({
            data: {
                requestId,
                approverId: req.user.id,
                decision: 'approved',
                comment: comment || 'Approved'
            }
        });

        const updatedRequest = await prisma.request.update({
            where: { id: requestId },
            data: { status: RequestStatus.Approved }
        });

        const approvalWithApprover = await prisma.approval.findUnique({
            where: { id: approval.id },
            include: { approver: { select: { name: true, email: true, role: true } } }
        });

        res.status(200).json({
            success: true,
            message: 'Request approved successfully',
            data: {
                request: updatedRequest,
                approval: approvalWithApprover
            }
        });
    } catch (error) {
        next(error);
    }
};

export const rejectRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { requestId } = req.params;
        const { comment } = req.body;

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

        if (request.status !== RequestStatus.Submitted) {
            return res.status(400).json({
                success: false,
                message: `Request has already been ${request.status}. Only submitted requests can be rejected.`
            });
        }

        const approval = await prisma.approval.create({
            data: {
                requestId,
                approverId: req.user.id,
                decision: 'rejected',
                comment: comment || 'Rejected'
            }
        });

        const updatedRequest = await prisma.request.update({
            where: { id: requestId },
            data: { status: RequestStatus.Rejected }
        });

        const approvalWithApprover = await prisma.approval.findUnique({
            where: { id: approval.id },
            include: { approver: { select: { name: true, email: true, role: true } } }
        });

        res.status(200).json({
            success: true,
            message: 'Request rejected successfully',
            data: {
                request: updatedRequest,
                approval: approvalWithApprover
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getApprovalHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { requestId } = req.params;

        const request = await prisma.request.findUnique({ where: { id: requestId } });
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        const approvals = await prisma.approval.findMany({
            where: { requestId },
            include: {
                approver: { select: { name: true, email: true, role: true } }
            },
            orderBy: { decisionDate: 'desc' }
        });

        res.status(200).json({
            success: true,
            message: 'Approval history retrieved successfully',
            data: {
                count: approvals.length,
                approvals
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getPendingApprovals = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { role, departmentId } = req.user;
        const filter: any = {
            status: { in: [RequestStatus.Submitted, RequestStatus.UnderReview] as any }
        };

        if (role === 'manager' || role === 'departmenthead') {
            if (departmentId) {
                filter.departmentId = departmentId;
            }
        }

        const requests = await prisma.request.findMany({
            where: filter,
            include: {
                user: { select: { name: true, email: true, role: true, department: true } },
                department: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        const { role, departmentId } = req.user;
        if (role === 'manager' || role === 'departmenthead') {
            // Filter in memory or query? Query is better but easier to filter results if complex.
            // Actually let's add it to the query.
            // We can modify the `where` clause before query. 
            // Re-writing the query logic below to be dynamic.
        }

        res.status(200).json({
            success: true,
            message: 'Pending approvals retrieved successfully',
            data: {
                count: requests.length,
                requests
            }
        });
    } catch (error) {
        next(error);
    }
};
