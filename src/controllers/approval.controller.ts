import { Request, Response, NextFunction } from 'express';
import ResourceRequest from '../model/request';
import Approval from '../model/approval';
import { RequestStatus } from '../types/request.interface';

/**
 * ============================================
 * APPROVE REQUEST
 * ============================================
 * 
 * This function approves a resource request.
 * Only managers, department heads, finance, or admin can approve.
 * 
 * Steps:
 * 1. Get request ID from URL and comment from body
 * 2. Find the request in database
 * 3. Check if request can be approved
 * 4. Create approval record
 * 5. Update request status to approved
 * 6. Send response
 */
export const approveRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Step 1: Get request ID and optional comment
        const { requestId } = req.params;
        const { comment } = req.body;

        // Step 2: Find the request and load related data
        const request = await ResourceRequest.findById(requestId)
            .populate('userId', 'name email')
            .populate('departmentId', 'name');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        // Step 3: Check if request is in submitted status
        if (request.status !== 'submitted') {
            return res.status(400).json({
                success: false,
                message: `Request has already been ${request.status}. Only submitted requests can be approved.`
            });
        }

        // Step 4: Create approval record in database
        const approval = await Approval.create({
            requestId,
            approverId: req.user._id,
            decision: 'approved',
            comment: comment || 'Approved'
        });

        // Step 5: Update request status to approved
        request.status = RequestStatus.Approved;
        await request.save();

        // Load approver details
        await approval.populate('approverId', 'name email role');

        // Step 6: Send success response
        res.status(200).json({
            success: true,
            message: 'Request approved successfully',
            data: {
                request,
                approval
            }
        });

    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};

/**
 * ============================================
 * REJECT REQUEST
 * ============================================
 * 
 * This function rejects a resource request.
 * Only managers, department heads, finance, or admin can reject.
 * 
 * Steps:
 * 1. Get request ID from URL and comment from body
 * 2. Find the request in database
 * 3. Check if request can be rejected
 * 4. Create approval record with rejection
 * 5. Update request status to rejected
 * 6. Send response
 */
export const rejectRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Step 1: Get request ID and comment (required for rejection)
        const { requestId } = req.params;
        const { comment } = req.body;

        // Step 2: Find the request and load related data
        const request = await ResourceRequest.findById(requestId)
            .populate('userId', 'name email')
            .populate('departmentId', 'name');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        // Step 3: Check if request is in submitted status
        if (request.status !== 'submitted') {
            return res.status(400).json({
                success: false,
                message: `Request has already been ${request.status}. Only submitted requests can be rejected.`
            });
        }

        // Step 4: Create approval record with rejection decision
        const approval = await Approval.create({
            requestId,
            approverId: req.user._id,
            decision: 'rejected',
            comment: comment || 'Rejected'
        });

        // Step 5: Update request status to rejected
        request.status = RequestStatus.Rejected;
        await request.save();

        // Load approver details
        await approval.populate('approverId', 'name email role');

        // Step 6: Send success response
        res.status(200).json({
            success: true,
            message: 'Request rejected successfully',
            data: {
                request,
                approval
            }
        });

    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};

/**
 * ============================================
 * GET APPROVAL HISTORY
 * ============================================
 * 
 * This function gets the approval history for a request.
 * Shows all approval/rejection decisions made on the request.
 * 
 * Steps:
 * 1. Get request ID from URL
 * 2. Check if request exists
 * 3. Find all approvals for this request
 * 4. Send response with approval history
 */
export const getApprovalHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Step 1: Get request ID from URL
        const { requestId } = req.params;

        // Step 2: Check if request exists
        const request = await ResourceRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        // Step 3: Find all approvals for this request
        const approvals = await Approval.find({ requestId })
            .populate('approverId', 'name email role')
            .sort({ decisionDate: -1 }); // Newest first

        // Step 4: Send response with approval history
        res.status(200).json({
            success: true,
            message: 'Approval history retrieved successfully',
            data: {
                count: approvals.length,
                approvals
            }
        });

    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};
