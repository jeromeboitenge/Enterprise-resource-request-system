import prisma from '../lib/prisma';
import { RequestStatus } from '../types/request.interface';
import { getApprovalInclude } from '../utils/queryHelpers';

export class ApprovalService {

    static determineNewStatus(role: string): RequestStatus {
        if (role === 'MANAGER') {
            return RequestStatus.SEMI_APPROVED;
        } else if (role === 'ADMIN') {
            return RequestStatus.APPROVED;
        }
        return RequestStatus.SUBMITTED;
    }

    static validateApprovalPermission(
        request: any,
        role: string,
        departmentId: string
    ): { allowed: boolean; message?: string } {
        // Manager validation
        if (role === 'MANAGER') {
            if (request.departmentId !== departmentId) {
                return {
                    allowed: false,
                    message: 'You can only approve requests from your own department'
                };
            }

            // Managers cannot approve requests from other managers
            // Manager requests go directly to SEMI_APPROVED status and need admin approval
            if (request.user?.role === 'MANAGER') {
                return {
                    allowed: false,
                    message: 'Manager requests require admin approval. You cannot approve requests from other managers.'
                };
            }

            if (request.status !== RequestStatus.SUBMITTED && request.status !== RequestStatus.DRAFT) {
                return {
                    allowed: false,
                    message: `Request has already been ${request.status}. You can only approve draft or submitted requests.`
                };
            }
        }

        // Admin validation
        if (role === 'ADMIN') {
            if (request.status !== RequestStatus.SEMI_APPROVED) {
                return {
                    allowed: false,
                    message: `Request status is ${request.status}. Admin can only approve requests already approved by a manager.`
                };
            }
        }

        return { allowed: true };
    }

    static async approveRequest(
        requestId: string,
        approverId: string,
        comment: string | undefined,
        role: string
    ) {
        // Create approval record
        const approval = await prisma.approval.create({
            data: {
                requestId,
                approverId,
                decision: 'APPROVED',
                comment: comment || 'Approved'
            }
        });

        // Determine new status based on role
        const newStatus = this.determineNewStatus(role);

        // Update request status
        const updatedRequest = await prisma.request.update({
            where: { id: requestId },
            data: { status: newStatus }
        });

        // Get approval with approver details
        const approvalWithApprover = await prisma.approval.findUnique({
            where: { id: approval.id },
            include: getApprovalInclude()
        });

        return {
            approval: approvalWithApprover,
            request: updatedRequest,
            newStatus
        };
    }

    static async rejectRequest(
        requestId: string,
        approverId: string,
        comment: string | undefined
    ) {
        // Create rejection record
        const approval = await prisma.approval.create({
            data: {
                requestId,
                approverId,
                decision: 'REJECTED',
                comment: comment || 'Rejected'
            }
        });

        // Update request status to rejected
        const updatedRequest = await prisma.request.update({
            where: { id: requestId },
            data: { status: RequestStatus.REJECTED }
        });

        // Get approval with approver details
        const approvalWithApprover = await prisma.approval.findUnique({
            where: { id: approval.id },
            include: getApprovalInclude()
        });

        return {
            approval: approvalWithApprover,
            request: updatedRequest
        };
    }

    static async getApprovalHistory(
        requestId: string,
        pagination: { skip: number; take: number }
    ) {
        const { skip, take } = pagination;

        const [approvals, total] = await Promise.all([
            prisma.approval.findMany({
                where: { requestId },
                include: {
                    approver: { select: { name: true, email: true, role: true } }
                },
                orderBy: { decisionDate: 'desc' },
                skip,
                take
            }),
            prisma.approval.count({ where: { requestId } })
        ]);

        return { approvals, total };
    }

    static async getPendingApprovals(
        role: string,
        departmentId: string,
        pagination: { skip: number; take: number }
    ) {
        const { skip, take } = pagination;
        let filter: any = {};

        if (role === 'MANAGER') {
            // Managers see SUBMITTED requests from their department
            // BUT exclude requests created by other managers (those go directly to admin)
            filter = {
                status: RequestStatus.SUBMITTED,
                departmentId: departmentId,
                user: {
                    role: {
                        not: 'MANAGER' // Exclude manager requests
                    }
                }
            };
        } else if (role === 'ADMIN') {
            // Admin approves requests that are already manager-approved
            // This includes manager requests (auto-SEMI_APPROVED) and employee requests approved by manager
            filter = {
                status: RequestStatus.SEMI_APPROVED
            };
        } else {
            filter = { status: 'NEVER_MATCH' };
        }

        const [requests, total] = await Promise.all([
            prisma.request.findMany({
                where: filter,
                include: {
                    user: { select: { name: true, email: true, role: true, department: true } },
                    department: { select: { name: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.request.count({ where: filter })
        ]);

        return { requests, total };
    }

    static validateRejectionPermission(
        request: any,
        role: string,
        departmentId: string
    ): { allowed: boolean; message?: string } {
        if (role === 'MANAGER' && request.departmentId !== departmentId) {
            return {
                allowed: false,
                message: 'You can only reject requests from your own department'
            };
        }

        const allowedStatuses = [RequestStatus.SUBMITTED, RequestStatus.SEMI_APPROVED];
        if (!allowedStatuses.includes(request.status as any)) {
            return {
                allowed: false,
                message: `Cannot reject request with status: ${request.status}. Only submitted or manager-approved requests can be rejected.`
            };
        }

        return { allowed: true };
    }
}
