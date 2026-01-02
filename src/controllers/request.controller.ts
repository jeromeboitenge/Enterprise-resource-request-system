import { Request, Response, NextFunction } from 'express';
import ResourceRequest from '../model/request';
import { ApiError } from '../utils/ApiError';
import { responseService } from '../utils/ResponseService';
import { asyncHandler } from '../utils/asyncHandler';
import { RequestStatus } from '../types/request.interface';

/**
 * Create a new resource request
 * @route POST /api/v1/requests
 * @access Private (Employee)
 */
export const createRequest = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { title, resourceName, resourceType, description, quantity, estimatedCost, priority, departmentId } = req.body;

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

        await request.populate([
            { path: 'userId', select: 'name email role' },
            { path: 'departmentId', select: 'name' }
        ]);

        return responseService.response({
            res,
            data: { request },
            message: 'Request created successfully',
            statusCode: 201
        });
    }
);

/**
 * Get requests created by current user
 * @route GET /api/v1/requests/my
 * @access Private
 */
export const getMyRequests = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { status } = req.query;

        const filter: any = { userId: req.user._id };
        if (status) {
            filter.status = status;
        }

        const requests = await ResourceRequest.find(filter)
            .populate('userId', 'name email role')
            .populate('departmentId', 'name')
            .sort({ createdAt: -1 });

        return responseService.response({
            res,
            data: {
                count: requests.length,
                requests
            },
            message: 'Requests retrieved successfully',
            statusCode: 200
        });
    }
);

/**
 * Get all requests (for managers and finance)
 * @route GET /api/v1/requests
 * @access Private (Manager, Finance, Admin)
 */
export const getAllRequests = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { status, departmentId } = req.query;

        const filter: any = {};
        if (status) {
            filter.status = status;
        }
        if (departmentId) {
            filter.departmentId = departmentId;
        }

        const requests = await ResourceRequest.find(filter)
            .populate('userId', 'name email role department')
            .populate('departmentId', 'name')
            .sort({ createdAt: -1 });

        return responseService.response({
            res,
            data: {
                count: requests.length,
                requests
            },
            message: 'Requests retrieved successfully',
            statusCode: 200
        });
    }
);

/**
 * Get single request by ID
 * @route GET /api/v1/requests/:id
 * @access Private
 */
export const getRequest = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const request = await ResourceRequest.findById(req.params.id)
            .populate('userId', 'name email role department')
            .populate('departmentId', 'name');

        if (!request) {
            throw ApiError.notFound('Request not found');
        }

        // Check if user has permission to view this request
        const requestUserId = typeof request.userId === 'object' ? (request.userId as any)._id : request.userId;
        const isOwner = requestUserId.toString() === req.user._id.toString();
        const isAuthorized = ['manager', 'finance', 'admin'].includes(req.user.role);

        if (!isOwner && !isAuthorized) {
            throw ApiError.forbidden('You do not have permission to view this request');
        }

        return responseService.response({
            res,
            data: { request },
            message: 'Request retrieved successfully',
            statusCode: 200
        });
    }
);

/**
 * Update request (only if pending)
 * @route PUT /api/v1/requests/:id
 * @access Private (Request owner only)
 */
export const updateRequest = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { title, resourceName, resourceType, description, quantity, estimatedCost, priority } = req.body;

        const request = await ResourceRequest.findById(req.params.id);

        if (!request) {
            throw ApiError.notFound('Request not found');
        }

        // Check if user is the owner
        if (request.userId.toString() !== req.user._id.toString()) {
            throw ApiError.forbidden('You can only update your own requests');
        }

        // Check if request is still in draft or submitted
        if (![RequestStatus.Draft, RequestStatus.Submitted].includes(request.status)) {
            throw ApiError.badRequest('Cannot update request that has been processed');
        }

        // Update fields
        if (title) request.title = title;
        if (resourceName) request.resourceName = resourceName;
        if (resourceType) request.resourceType = resourceType;
        if (description !== undefined) request.description = description;
        if (quantity) request.quantity = quantity;
        if (estimatedCost) request.estimatedCost = estimatedCost;
        if (priority) request.priority = priority;

        await request.save();
        await request.populate([
            { path: 'userId', select: 'name email role' },
            { path: 'departmentId', select: 'name' }
        ]);

        return responseService.response({
            res,
            data: { request },
            message: 'Request updated successfully',
            statusCode: 200
        });
    }
);

/**
 * Delete request (only if pending)
 * @route DELETE /api/v1/requests/:id
 * @access Private (Request owner only)
 */
export const deleteRequest = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const request = await ResourceRequest.findById(req.params.id);

        if (!request) {
            throw ApiError.notFound('Request not found');
        }

        // Check if user is the owner
        if (request.userId.toString() !== req.user._id.toString()) {
            throw ApiError.forbidden('You can only delete your own requests');
        }

        // Check if request is still in draft or submitted
        if (![RequestStatus.Draft, RequestStatus.Submitted].includes(request.status)) {
            throw ApiError.badRequest('Cannot delete request that has been processed');
        }

        await request.deleteOne();

        return responseService.response({
            res,
            data: { request },
            message: 'Request deleted successfully',
            statusCode: 200
        });
    }
);

