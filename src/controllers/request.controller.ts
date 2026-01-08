import { Request, Response, NextFunction } from 'express';
import { RequestService } from '../services/request.service';
import { getPaginationParams, createPaginatedResponse } from '../utils/pagination';

export const createRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

        const request = await RequestService.createRequest({
            userId: req.user.id,
            departmentId: req.user.departmentId,
            title,
            resourceName,
            resourceType,
            description,
            quantity,
            estimatedCost,
            priority,
            userRole: req.user.role // Pass user role for auto-approval logic
        });

        res.status(201).json({
            success: true,
            message: 'Request created successfully',
            data: { request }
        });
    } catch (error) {
        next(error);
    }
};

export const getMyRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { page, limit, skip, take } = getPaginationParams(req.query);
        const filters = { status: req.query.status as string | undefined };

        const { requests, total } = await RequestService.getMyRequests(
            req.user.id,
            filters,
            { skip, take }
        );

        res.status(200).json({
            success: true,
            message: 'Requests retrieved successfully',
            data: createPaginatedResponse(requests, total, page, limit)
        });
    } catch (error) {
        next(error);
    }
};

export const getAllRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { page, limit, skip, take } = getPaginationParams(req.query);
        const filters = {
            status: req.query.status as string | undefined,
            departmentId: req.query.departmentId as string | undefined
        };

        const { requests, total } = await RequestService.getAllRequests(
            filters,
            { skip, take },
            req.user.role,
            req.user.departmentId
        );

        res.status(200).json({
            success: true,
            message: 'Requests retrieved successfully',
            data: createPaginatedResponse(requests, total, page, limit)
        });
    } catch (error) {
        next(error);
    }
};

export const getRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const request = await RequestService.getRequestById(req.params.id);

        if (!request) {
            res.status(404).json({
                success: false,
                message: `Request not found with ID: ${req.params.id}`
            });
            return;
        }

        const hasPermission = RequestService.checkPermission(request, req.user);

        if (!hasPermission) {
            res.status(403).json({
                success: false,
                message: 'You do not have permission to view this request'
            });
            return;
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

export const updateRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

        const existingRequest = await RequestService.getRequestById(req.params.id);

        if (!existingRequest) {
            res.status(404).json({
                success: false,
                message: `Request not found with ID: ${req.params.id}`
            });
            return;
        }

        const hasPermission = RequestService.checkPermission(existingRequest, req.user);

        if (!hasPermission) {
            res.status(403).json({
                success: false,
                message: 'You do not have permission to update this request'
            });
            return;
        }

        const statusValidation = RequestService.validateStatusTransition(existingRequest.status, 'update');

        if (!statusValidation.allowed) {
            res.status(400).json({
                success: false,
                message: statusValidation.message
            });
            return;
        }

        const request = await RequestService.updateRequest(
            req.params.id,
            { title, resourceName, resourceType, description, quantity, estimatedCost, priority },
            existingRequest.status
        );

        res.status(200).json({
            success: true,
            message: 'Request updated successfully',
            data: { request }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const existingRequest = await RequestService.getRequestById(req.params.id);

        if (!existingRequest) {
            res.status(404).json({
                success: false,
                message: `Request not found with ID: ${req.params.id}`
            });
            return;
        }

        const hasPermission = RequestService.checkPermission(existingRequest, req.user);

        if (!hasPermission) {
            res.status(403).json({
                success: false,
                message: 'You do not have permission to delete this request'
            });
            return;
        }

        const statusValidation = RequestService.validateStatusTransition(existingRequest.status, 'delete');

        if (!statusValidation.allowed) {
            res.status(400).json({
                success: false,
                message: statusValidation.message
            });
            return;
        }

        await RequestService.deleteRequest(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Request deleted successfully',
            data: { request: existingRequest }
        });
    } catch (error) {
        next(error);
    }
};

export const submitRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const existingRequest = await RequestService.getRequestById(req.params.id);

        if (!existingRequest) {
            res.status(404).json({
                success: false,
                message: `Request not found with ID: ${req.params.id}`
            });
            return;
        }

        if (existingRequest.userId !== req.user.id) {
            res.status(403).json({
                success: false,
                message: 'You can only submit your own requests'
            });
            return;
        }

        const statusValidation = RequestService.validateStatusTransition(existingRequest.status, 'submit');

        if (!statusValidation.allowed) {
            res.status(400).json({
                success: false,
                message: statusValidation.message
            });
            return;
        }

        const request = await RequestService.submitRequest(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Request submitted successfully',
            data: { request }
        });
    } catch (error) {
        next(error);
    }
};

export const cancelRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const existingRequest = await RequestService.getRequestById(req.params.id);

        if (!existingRequest) {
            res.status(404).json({
                success: false,
                message: `Request not found with ID: ${req.params.id}`
            });
            return;
        }

        if (existingRequest.userId !== req.user.id) {
            res.status(403).json({
                success: false,
                message: 'You can only cancel your own requests'
            });
            return;
        }

        const statusValidation = RequestService.validateStatusTransition(existingRequest.status, 'cancel');

        if (!statusValidation.allowed) {
            res.status(400).json({
                success: false,
                message: statusValidation.message
            });
            return;
        }

        const request = await RequestService.cancelRequest(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Request cancelled successfully',
            data: { request }
        });
    } catch (error) {
        next(error);
    }
};

export const getDepartmentRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { page, limit, skip, take } = getPaginationParams(req.query);
        const filters = { status: req.query.status as string | undefined };

        const { requests, total } = await RequestService.getDepartmentRequests(
            req.user.departmentId,
            filters,
            { skip, take }
        );

        res.status(200).json({
            success: true,
            message: 'Department requests retrieved successfully',
            data: createPaginatedResponse(requests, total, page, limit)
        });
    } catch (error) {
        next(error);
    }
};
