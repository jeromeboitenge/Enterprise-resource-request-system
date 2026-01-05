import { Request, Response, NextFunction } from 'express';
import ResourceRequest from '../model/request';
import { RequestStatus } from '../types/request.interface';

export const createRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            title,
            resourceName,
            resourceType,
            description,
            quantity,
            estimatedCost,
            priority,
            departmentId
        } = req.body;

        const request = await ResourceRequest.create({
            userId: req.user._id,
            departmentId,
            title,
            resourceName,
            resourceType,
            description,
            quantity,
            estimatedCost,
            priority,
            status: RequestStatus.Draft
        });

        await request.populate('userId', 'name email role');
        await request.populate('departmentId', 'name code');

        res.status(201).json({
            success: true,
            message: 'Request created successfully',
            data: { request }
        });
    } catch (error) {
        next(error);
    }
};

export const getMyRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filter: any = { userId: req.user._id };

        if (req.query.status) {
            filter.status = req.query.status;
        }

        const requests = await ResourceRequest.find(filter)
            .populate('userId', 'name email role')
            .populate('departmentId', 'name code')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Requests retrieved successfully',
            data: {
                count: requests.length,
                requests
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getAllRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filter: any = {};

        if (req.query.status) {
            filter.status = req.query.status;
        }

        if (req.query.departmentId) {
            filter.departmentId = req.query.departmentId;
        }

        const requests = await ResourceRequest.find(filter)
            .populate('userId', 'name email role department')
            .populate('departmentId', 'name code')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Requests retrieved successfully',
            data: {
                count: requests.length,
                requests
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const request = await ResourceRequest.findById(req.params.id)
            .populate('userId', 'name email role department')
            .populate('departmentId', 'name code');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: `Request not found with ID: ${req.params.id}`
            });
        }

        const requestUserId = typeof request.userId === 'object'
            ? (request.userId as any)._id
            : request.userId;

        const isOwner = requestUserId.toString() === req.user._id.toString();
        const isAuthorized = ['manager', 'departmenthead', 'finance', 'admin'].includes(req.user.role);

        if (!isOwner && !isAuthorized) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view this request'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Request retrieved successfully',
            data: { request }
        });
    } catch (error) {
        next(error);
    }
};

export const updateRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            title,
            resourceName,
            resourceType,
            description,
            quantity,
            estimatedCost,
            priority
        } = req.body;

        const request = await ResourceRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: `Request not found with ID: ${req.params.id}`
            });
        }

        if (request.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own requests'
            });
        }

        const allowedStatuses = [RequestStatus.Draft, RequestStatus.Submitted];
        if (!allowedStatuses.includes(request.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot update request with status: ${request.status}. Only draft or submitted requests can be updated.`
            });
        }

        if (title) request.title = title;
        if (resourceName) request.resourceName = resourceName;
        if (resourceType) request.resourceType = resourceType;
        if (description !== undefined) request.description = description;
        if (quantity) request.quantity = quantity;
        if (estimatedCost) request.estimatedCost = estimatedCost;
        if (priority) request.priority = priority;

        await request.save();

        await request.populate('userId', 'name email role');
        await request.populate('departmentId', 'name code');

        res.status(200).json({
            success: true,
            message: 'Request updated successfully',
            data: { request }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const request = await ResourceRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: `Request not found with ID: ${req.params.id}`
            });
        }

        if (request.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own requests'
            });
        }

        const allowedStatuses = [RequestStatus.Draft, RequestStatus.Submitted];
        if (!allowedStatuses.includes(request.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete request with status: ${request.status}. Only draft or submitted requests can be deleted.`
            });
        }

        await request.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Request deleted successfully',
            data: { request }
        });
    } catch (error) {
        next(error);
    }
};

export const submitRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const request = await ResourceRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: `Request not found with ID: ${req.params.id}`
            });
        }

        if (request.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only submit your own requests'
            });
        }

        if (request.status !== RequestStatus.Draft) {
            return res.status(400).json({
                success: false,
                message: `Cannot submit request with status: ${request.status}. Only draft requests can be submitted.`
            });
        }

        request.status = RequestStatus.Submitted;
        await request.save();

        await request.populate('userId', 'name email role');
        await request.populate('departmentId', 'name');

        res.status(200).json({
            success: true,
            message: 'Request submitted successfully',
            data: { request }
        });
    } catch (error) {
        next(error);
    }
};

export const cancelRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const request = await ResourceRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: `Request not found with ID: ${req.params.id}`
            });
        }

        if (request.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only cancel your own requests'
            });
        }

        const allowedStatuses = [RequestStatus.Draft, RequestStatus.Submitted, RequestStatus.UnderReview];
        if (!allowedStatuses.includes(request.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel request with status: ${request.status}. Only draft, submitted, or under review requests can be cancelled.`
            });
        }

        request.status = RequestStatus.Cancelled;
        await request.save();

        await request.populate('userId', 'name email role');
        await request.populate('departmentId', 'name');

        res.status(200).json({
            success: true,
            message: 'Request cancelled successfully',
            data: { request }
        });
    } catch (error) {
        next(error);
    }
};

export const getDepartmentRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filter: any = { departmentId: req.user.department };

        if (req.query.status) {
            filter.status = req.query.status;
        }

        const requests = await ResourceRequest.find(filter)
            .populate('userId', 'name email role')
            .populate('departmentId', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Department requests retrieved successfully',
            data: {
                count: requests.length,
                requests
            }
        });
    } catch (error) {
        next(error);
    }
};
