import { Request, Response, NextFunction } from 'express';
import ResourceRequest from '../model/request';
import Approval from '../model/approval';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { RequestStatus } from '../types/request.interface';
import { ApprovalDecision } from '../types/approval.interface';

/**
 * Approve a request
 * @route POST /api/v1/approvals/:requestId/approve
 * @access Private (Manager only)
 */
export const approveRequest = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { requestId } = req.params;
        const { comment } = req.body;

        // Find the request
        const request = await ResourceRequest.findById(requestId)
            .populate('userId', 'name email')
            .populate('departmentId', 'name');

        if (!request) {
            throw ApiError.notFound('Request not found');
        }

        // Check if request is pending
        if (request.status !== RequestStatus.Pending) {
            throw ApiError.badRequest(
                `Request has already been ${request.status}`
            );
        }

        // Create approval record
        const approval = await Approval.create({
            requestId,
            approverId: req.user._id,
            decision: ApprovalDecision.Approved,
            comment
        });

        // Update request status
        request.status = RequestStatus.Approved;
        await request.save();

        await approval.populate('approverId', 'name email role');

        ApiResponse.success('Request approved successfully', {
            request,
            approval
        }).send(res);
    }
);

/**
 * Reject a request
 * @route POST /api/v1/approvals/:requestId/reject
 * @access Private (Manager only)
 */
export const rejectRequest = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { requestId } = req.params;
        const { comment } = req.body;

        // Find the request
        const request = await ResourceRequest.findById(requestId)
            .populate('userId', 'name email')
            .populate('departmentId', 'name');

        if (!request) {
            throw ApiError.notFound('Request not found');
        }

        // Check if request is pending
        if (request.status !== RequestStatus.Pending) {
            throw ApiError.badRequest(
                `Request has already been ${request.status}`
            );
        }

        // Create approval record
        const approval = await Approval.create({
            requestId,
            approverId: req.user._id,
            decision: ApprovalDecision.Rejected,
            comment
        });

        // Update request status
        request.status = RequestStatus.Rejected;
        await request.save();

        await approval.populate('approverId', 'name email role');

        ApiResponse.success('Request rejected successfully', {
            request,
            approval
        }).send(res);
    }
);

/**
 * Get approval history for a request
 * @route GET /api/v1/approvals/:requestId
 * @access Private
 */
export const getApprovalHistory = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { requestId } = req.params;

        // Check if request exists
        const request = await ResourceRequest.findById(requestId);
        if (!request) {
            throw ApiError.notFound('Request not found');
        }

        // Get approval history
        const approvals = await Approval.find({ requestId })
            .populate('approverId', 'name email role')
            .sort({ decisionDate: -1 });

        ApiResponse.success('Approval history retrieved successfully', {
            count: approvals.length,
            approvals
        }).send(res);
    }
);
