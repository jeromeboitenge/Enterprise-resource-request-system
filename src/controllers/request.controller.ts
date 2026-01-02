import { Request, Response, NextFunction } from 'express';
import ResourceRequest from '../model/request';
import { ApiError } from '../utils/ApiError';
import { responseService } from '../utils/ResponseService';
import { asyncHandler } from '../utils/asyncHandler';
import { RequestStatus } from '../types/request.interface';
import { populateRequest } from '../utils/populateHelpers';
import { validateOwnership, validateRequestStatus, validateResourceExists } from '../utils/validationHelpers';
import { buildFilter } from '../utils/queryHelpers';

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

        await populateRequest(request);

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

        const filter = buildFilter({
            userId: req.user._id,
            status: req.query.status
        });

        const requests = await populateRequest(
            ResourceRequest.find(filter).sort({ createdAt: -1 })
        );

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

        const filter = buildFilter({
            status: req.query.status,
            departmentId: req.query.departmentId
        });

        const requests = await populateRequest(
            ResourceRequest.find(filter).sort({ createdAt: -1 }),
            true // include user department
        );

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
        const request = await populateRequest(
            ResourceRequest.findById(req.params.id),
            true
        );

        validateResourceExists(request, 'Request', req.params.id);

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
        validateResourceExists(request, 'Request', req.params.id);

        // Validate ownership (non-null assertion safe after validation)
        validateOwnership(
            request!.userId.toString(),
            req.user._id.toString(),
            'request'
        );

        // Validate request status
        validateRequestStatus(
            request!.status,
            [RequestStatus.Draft, RequestStatus.Submitted],
            'update'
        );

        // Update fields (non-null assertion safe after validation)
        if (title) request!.title = title;
        if (resourceName) request!.resourceName = resourceName;
        if (resourceType) request!.resourceType = resourceType;
        if (description !== undefined) request!.description = description;
        if (quantity) request!.quantity = quantity;
        if (estimatedCost) request!.estimatedCost = estimatedCost;
        if (priority) request!.priority = priority;

        await request!.save();
        await populateRequest(request!);

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
        validateResourceExists(request, 'Request', req.params.id);

        // Validate ownership (non-null assertion safe after validation)
        validateOwnership(
            request!.userId.toString(),
            req.user._id.toString(),
            'request'
        );

        // Validate request status
        validateRequestStatus(
            request!.status,
            [RequestStatus.Draft, RequestStatus.Submitted],
            'delete'
        );

        await request!.deleteOne();

        return responseService.response({
            res,
            data: { request },
            message: 'Request deleted successfully',
            statusCode: 200
        });
    }
);

