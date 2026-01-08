import { Request, Response, NextFunction } from 'express';
import { ApprovalService } from '../services/approval.service';
import { RequestService } from '../services/request.service';
import { sendEmail } from '../utils/email.service';
import { generateEmailHtml } from '../utils/email.templates';
import { getPaginationParams, createPaginatedResponse } from '../utils/pagination';

export const approveRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { requestId } = req.params;
        const { comment } = req.body;

        const request = await RequestService.getRequestById(requestId);

        if (!request) {
            res.status(404).json({
                success: false,
                message: `Request with ID ${req.params.requestId} not found`
            });
            return;
        }

        const { role, departmentId } = req.user;

        const permissionCheck = ApprovalService.validateApprovalPermission(request, role, departmentId);

        if (!permissionCheck.allowed) {
            res.status(role === 'MANAGER' ? 403 : 400).json({
                success: false,
                message: permissionCheck.message
            });
            return;
        }

        const result = await ApprovalService.approveRequest(
            requestId,
            req.user.id,
            comment,
            role
        );

        // Send email notification
        if ((request as any).user?.email) {
            const subject = `Request Approved: ${(request as any).title}`;
            const text = `Your request "${(request as any).title}" has been approved to status "${result.newStatus}".\n\nApprover Comment: ${comment || 'No comment provided.'}`;
            const html = generateEmailHtml(
                'Request Approved',
                `Your request "<strong>${(request as any).title}</strong>" has been approved to status "<strong>${result.newStatus}</strong>".<br><br><strong>Approver Comment:</strong> ${comment || 'No comment provided.'}`,
                `http://localhost:3000/requests/${requestId}`,
                'View Request'
            );
            await sendEmail((request as any).user.email, subject, text, html).catch(err => console.error('Failed to send email:', err));
        }

        res.status(200).json({
            success: true,
            message: 'Request approved successfully',
            data: {
                request: result.request,
                approval: result.approval
            }
        });
    } catch (error) {
        next(error);
    }
};

export const rejectRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { requestId } = req.params;
        const { comment } = req.body;

        const request = await RequestService.getRequestById(requestId);

        if (!request) {
            res.status(404).json({
                success: false,
                message: 'Request not found'
            });
            return;
        }

        const { role, departmentId } = req.user;

        const permissionCheck = ApprovalService.validateRejectionPermission(request, role, departmentId);

        if (!permissionCheck.allowed) {
            res.status(role === 'MANAGER' ? 403 : 400).json({
                success: false,
                message: permissionCheck.message
            });
            return;
        }

        const result = await ApprovalService.rejectRequest(
            requestId,
            req.user.id,
            comment
        );

        // Send email notification
        if ((request as any).user?.email) {
            const subject = `Request Rejected: ${(request as any).title}`;
            const text = `Your request "${(request as any).title}" has been rejected.\n\nRejection Comment: ${comment || 'No comment provided.'}`;
            const html = generateEmailHtml(
                'Request Rejected',
                `Your request "<strong>${(request as any).title}</strong>" has been rejected.<br><br><strong>Rejection Comment:</strong> ${comment || 'No comment provided.'}`,
                `http://localhost:3000/requests/${requestId}`,
                'View Request'
            );
            await sendEmail((request as any).user.email, subject, text, html).catch(err => console.error('Failed to send email:', err));
        }

        res.status(200).json({
            success: true,
            message: 'Request rejected successfully',
            data: {
                request: result.request,
                approval: result.approval
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getApprovalHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { requestId } = req.params;
        const { page, limit, skip, take } = getPaginationParams(req.query);

        const request = await RequestService.getRequestById(requestId);
        if (!request) {
            res.status(404).json({
                success: false,
                message: 'Request not found'
            });
            return;
        }

        const { approvals, total } = await ApprovalService.getApprovalHistory(
            requestId,
            { skip, take }
        );

        const paginatedResponse = createPaginatedResponse(
            approvals,
            total,
            page,
            limit
        );

        res.status(200).json({
            success: true,
            message: 'Approval history retrieved successfully',
            data: paginatedResponse
        });
    } catch (error) {
        next(error);
    }
};

export const getPendingApprovals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { role, departmentId } = req.user;
        const { page, limit, skip, take } = getPaginationParams(req.query);

        const { requests, total } = await ApprovalService.getPendingApprovals(
            role,
            departmentId,
            { skip, take }
        );

        const paginatedResponse = createPaginatedResponse(
            requests,
            total,
            page,
            limit
        );

        res.status(200).json({
            success: true,
            message: 'Pending approvals retrieved successfully',
            data: paginatedResponse
        });
    } catch (error) {
        next(error);
    }
};
