import { Request, Response, NextFunction } from 'express';
import ResourceRequest from '../model/request';
import Approval from '../model/approval';
import { RequestStatus } from '../types/request.interface';

export const approveRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { requestId } = req.params;
        const { comment } = req.body;

        const request = await ResourceRequest.findById(requestId)
            .populate('userId', 'name email')
            .populate('departmentId', 'name');

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

        const approval = await Approval.create({
            requestId,
            approverId: req.user._id,
            decision: 'approved',
            comment: comment || 'Approved'
        });

        request.status = RequestStatus.Approved;
        await request.save();

        await approval.populate('approverId', 'name email role');

        res.status(200).json({
            success: true,
            message: 'Request approved successfully',
            data: {
                request,
                approval
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

        const request = await ResourceRequest.findById(requestId)
            .populate('userId', 'name email')
            .populate('departmentId', 'name');

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

        const approval = await Approval.create({
            requestId,
            approverId: req.user._id,
            decision: 'rejected',
            comment: comment || 'Rejected'
        });

        request.status = RequestStatus.Rejected;
        await request.save();

        await approval.populate('approverId', 'name email role');

        res.status(200).json({
            success: true,
            message: 'Request rejected successfully',
            data: {
                request,
                approval
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getApprovalHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { requestId } = req.params;

        const request = await ResourceRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        const approvals = await Approval.find({ requestId })
            .populate('approverId', 'name email role')
            .sort({ decisionDate: -1 });

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
