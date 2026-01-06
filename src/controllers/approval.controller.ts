import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { RequestStatus } from '../types/request.interface';
import { sendEmail } from '../utils/email.service';
import { generateEmailHtml } from '../utils/email.templates';

export const approveRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { requestId } = req.params;
        const { comment } = req.body;

        const request = await prisma.request.findUnique({
            where: { id: requestId },
            include: {
                user: { select: { name: true, email: true } },
                department: { select: { name: true, managerId: true } }
            }
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        const { role, departmentId } = req.user;
        if ((role === 'manager' || role === 'departmenthead') && request.departmentId !== departmentId) {
            return res.status(403).json({
                success: false,
                message: 'You can only approve requests from your own department'
            });
        }

        if (role === 'manager' || role === 'departmenthead') {
            if (request.status !== RequestStatus.Submitted) {
                return res.status(400).json({
                    success: false,
                    message: `Request has already been ${request.status}. You can only approve submitted requests.`
                });
            }
        } else if (role === 'admin') {
            const isManagerless = !request.department.managerId;
            const allowedStatuses = isManagerless
                ? [RequestStatus.Submitted, RequestStatus.ManagerApproved]
                : [RequestStatus.ManagerApproved];

            if (!allowedStatuses.includes(request.status as any)) {
                return res.status(400).json({
                    success: false,
                    message: isManagerless
                        ? `Request status is ${request.status}. Admin acting as manager can approve submitted or manager-approved requests.`
                        : `Request status is ${request.status}. Admin can only approve requests already approved by a manager.`
                });
            }
        } else {
            // For any other role, or failsafe
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to approve this request at this stage.'
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

        let newStatus = RequestStatus.Approved;
        if (role === 'manager' || role === 'departmenthead') {
            newStatus = RequestStatus.ManagerApproved;
        } else if (role === 'admin' && request.status === RequestStatus.Submitted) {
            // Admin acting as manager
            newStatus = RequestStatus.ManagerApproved;
        }

        const updatedRequest = await prisma.request.update({
            where: { id: requestId },
            data: { status: newStatus }
        });

        const approvalWithApprover = await prisma.approval.findUnique({
            where: { id: approval.id },
            include: { approver: { select: { name: true, email: true, role: true } } }
        });

        // Send email notification
        if (request.user?.email) {
            const subject = `Request Approved: ${request.title}`;
            const text = `Your request "${request.title}" has been approved to status "${newStatus}".\n\nApprover Comment: ${comment || 'No comment provided.'}`;
            const html = generateEmailHtml(
                'Request Approved',
                `Your request "<strong>${request.title}</strong>" has been approved to status "<strong>${newStatus}</strong>".<br><br><strong>Approver Comment:</strong> ${comment || 'No comment provided.'}`,
                `http://localhost:3000/requests/${requestId}`,
                'View Request'
            );
            await sendEmail(request.user.email, subject, text, html).catch(err => console.error('Failed to send email:', err));
        }

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

        const { role, departmentId } = req.user;
        if ((role === 'manager' || role === 'departmenthead') && request?.departmentId !== departmentId) {
            return res.status(403).json({
                success: false,
                message: 'You can only reject requests from your own department'
            });
        }

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        const allowedStatuses = [RequestStatus.Submitted, RequestStatus.ManagerApproved];
        if (!allowedStatuses.includes(request.status as any)) {
            return res.status(400).json({
                success: false,
                message: `Cannot reject request with status: ${request.status}. Only submitted or manager-approved requests can be rejected.`
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

        // Send email notification
        if (request.user?.email) {
            const subject = `Request Rejected: ${request.title}`;
            const text = `Your request "${request.title}" has been rejected.\n\nRejection Comment: ${comment || 'No comment provided.'}`;
            const html = generateEmailHtml(
                'Request Rejected',
                `Your request "<strong>${request.title}</strong>" has been rejected.<br><br><strong>Rejection Comment:</strong> ${comment || 'No comment provided.'}`,
                `http://localhost:3000/requests/${requestId}`,
                'View Request'
            );
            await sendEmail(request.user.email, subject, text, html).catch(err => console.error('Failed to send email:', err));
        }

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
        let filter: any = {};

        if (role === 'manager' || role === 'departmenthead') {
            filter = {
                status: RequestStatus.Submitted,
                departmentId: departmentId
            };
        } else if (role === 'admin') {
            filter = {
                OR: [
                    { status: RequestStatus.ManagerApproved },
                    {
                        status: RequestStatus.Submitted,
                        department: { managerId: null }
                    }
                ]
            };
        } else {
            // Fallback or other roles? Maybe finance sees Approved?
            // For now, keeping it restricted to approval flow.
            filter = { status: 'NEVER_MATCH' }; // Prevent seeing anything if not approver
        }

        const requests = await prisma.request.findMany({
            where: filter,
            include: {
                user: { select: { name: true, email: true, role: true, department: true } },
                department: { select: { name: true, managerId: true } }
            },
            orderBy: { createdAt: 'desc' }
        });



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
