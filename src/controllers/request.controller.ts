import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { RequestStatus } from '../types/request.interface';
import { getPaginationParams, createPaginatedResponse } from '../utils/pagination';
import { getRequestInclude, getAdminFallback, attachAdminAsManager } from '../utils/queryHelpers';

export const createRequest = async (req: Request, res: Response, next: NextFunction) => {
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

        if (!req.user.departmentId) {
            return res.status(400).json({
                success: false,
                message: 'You are not assigned to any department. Please contact admin.'
            });
        }

        const request = await prisma.request.create({
            data: {
                userId: req.user.id,
                departmentId: req.user.departmentId,
                title,
                resourceName,
                resourceType,
                description,
                quantity,
                estimatedCost,
                priority,
                status: RequestStatus.SUBMITTED
            },
            include: getRequestInclude()
        });

        if (!(request.department as any).manager) {
            const admin = await getAdminFallback(prisma);
            if (admin && request.department) {
                (request.department as any).manager = { name: admin.name };
            }
        }

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
        const filter: any = { userId: req.user.id };

        if (req.query.status) {
            filter.status = req.query.status as string;
        }

        const { page, limit, skip, take } = getPaginationParams(req.query);

        const [total, requests, admin] = await Promise.all([
            prisma.request.count({ where: filter }),
            prisma.request.findMany({
                where: filter,
                include: getRequestInclude(),
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            getAdminFallback(prisma)
        ]);

        const processedRequests = attachAdminAsManager(requests, admin);

        res.status(200).json({
            success: true,
            message: 'Requests retrieved successfully',
            data: createPaginatedResponse(processedRequests, total, page, limit)
        });
    } catch (error) {
        next(error);
    }
};

export const getAllRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filter: any = {};
        const { role, departmentId } = req.user;

        if (role === 'MANAGER' || role === 'MANAGER') {
            if (!departmentId) {
                return res.status(400).json({
                    success: false,
                    message: 'Manager/Head has no assigned department.'
                });
            }
            filter.departmentId = departmentId;
        }

        if (req.query.status) {
            filter.status = req.query.status as string;
        }

        if (req.query.departmentId) {
            filter.departmentId = req.query.departmentId as string;
        }

        const { page, limit, skip, take } = getPaginationParams(req.query);

        const [total, requests, admin] = await Promise.all([
            prisma.request.count({ where: filter }),
            prisma.request.findMany({
                where: filter,
                include: getRequestInclude(),
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            getAdminFallback(prisma)
        ]);

        const processedRequests = attachAdminAsManager(requests, admin);

        res.status(200).json({
            success: true,
            message: 'Requests retrieved successfully',
            data: createPaginatedResponse(processedRequests, total, page, limit)
        });
    } catch (error) {
        next(error);
    }
};

export const getRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [request, admin] = await Promise.all([
            prisma.request.findUnique({
                where: { id: req.params.id },
                include: getRequestInclude()
            }),
            getAdminFallback(prisma)
        ]);

        if (request && !(request.department as any).manager && admin) {
            (request.department as any).manager = { name: admin.name };
        }

        if (!request) {
            return res.status(404).json({
                success: false,
                message: `Request not found with ID: ${req.params.id}`
            });
        }


        const isOwner = request.userId === req.user.id;
        const isManagerOfDept = (req.user.role === 'MANAGER' || req.user.role === 'MANAGER') &&
            request.departmentId === req.user.departmentId;
        const isAdmin = req.user.role === 'ADMIN';
        const isFinance = req.user.role === 'finance';

        if (!isOwner && !isManagerOfDept && !isAdmin && !isFinance) {
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

        const existingRequest = await prisma.request.findUnique({
            where: { id: req.params.id }
        });

        if (!existingRequest) {
            return res.status(404).json({
                success: false,
                message: `Request not found with ID: ${req.params.id}`
            });
        }


        const isOwner = existingRequest.userId === req.user.id;
        const isManagerOfDept = (req.user.role === 'MANAGER' || req.user.role === 'MANAGER') &&
            existingRequest.departmentId === req.user.departmentId;
        const isAdmin = req.user.role === 'ADMIN';

        if (!isOwner && !isManagerOfDept && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to update this request'
            });
        }

        const allowedStatuses = [RequestStatus.DRAFT, RequestStatus.SUBMITTED, RequestStatus.REJECTED];
        if (!allowedStatuses.includes(existingRequest.status as any)) {
            return res.status(400).json({
                success: false,
                message: `Cannot update request with status: ${existingRequest.status}. Request is likely already approved or processing.`
            });
        }


        let dataToUpdate: any = {};

        if (existingRequest.status === RequestStatus.SUBMITTED) {
            if (description !== undefined) dataToUpdate.description = description;


            if (Object.keys(dataToUpdate).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'For submitted requests, only the description (optional field) can be modified.'
                });
            }

        } else {
            dataToUpdate = {
                title,
                resourceName,
                resourceType,
                description,
                quantity,
                estimatedCost,
                priority
            };
        }

        const request = await prisma.request.update({
            where: { id: req.params.id },
            data: dataToUpdate,
            include: {
                user: { select: { name: true, email: true, role: true } },
                department: { select: { name: true, code: true } }
            }
        });

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
        const existingRequest = await prisma.request.findUnique({
            where: { id: req.params.id }
        });

        if (!existingRequest) {
            return res.status(404).json({
                success: false,
                message: `Request not found with ID: ${req.params.id}`
            });
        }

        const isOwner = existingRequest.userId === req.user.id;
        const isManagerOfDept = (req.user.role === 'MANAGER' || req.user.role === 'MANAGER') &&
            existingRequest.departmentId === req.user.departmentId;
        const isAdmin = req.user.role === 'ADMIN';

        if (!isOwner && !isManagerOfDept && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to delete this request'
            });
        }

        const allowedStatuses = [RequestStatus.DRAFT, RequestStatus.SUBMITTED, RequestStatus.REJECTED];
        if (!allowedStatuses.includes(existingRequest.status as any)) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete request with status: ${existingRequest.status}. Request has likely already been approved.`
            });
        }

        await prisma.request.delete({
            where: { id: req.params.id }
        });

        res.status(200).json({
            success: true,
            message: 'Request deleted successfully',
            data: { request: existingRequest }
        });
    } catch (error) {
        next(error);
    }
};

export const submitRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const existingRequest = await prisma.request.findUnique({
            where: { id: req.params.id }
        });

        if (!existingRequest) {
            return res.status(404).json({
                success: false,
                message: `Request not found with ID: ${req.params.id}`
            });
        }

        if (existingRequest.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only submit your own requests'
            });
        }

        const allowedStatuses = [RequestStatus.DRAFT, RequestStatus.REJECTED];
        if (!allowedStatuses.includes(existingRequest.status as any)) {
            return res.status(400).json({
                success: false,
                message: `Cannot submit request with status: ${existingRequest.status}. Only draft or rejected requests can be submitted.`
            });
        }

        const request = await prisma.request.update({
            where: { id: req.params.id },
            data: { status: RequestStatus.SUBMITTED },
            include: {
                user: { select: { name: true, email: true, role: true } },
                department: { select: { name: true } }
            }
        });

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
        const existingRequest = await prisma.request.findUnique({
            where: { id: req.params.id }
        });

        if (!existingRequest) {
            return res.status(404).json({
                success: false,
                message: `Request not found with ID: ${req.params.id}`
            });
        }

        if (existingRequest.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only cancel your own requests'
            });
        }

        const allowedStatuses = [RequestStatus.DRAFT, RequestStatus.SUBMITTED, RequestStatus.SEMI_APPROVED];
        if (!allowedStatuses.includes(existingRequest.status as any)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel request with status: ${existingRequest.status}. Only draft, submitted, or under review requests can be cancelled.`
            });
        }

        const request = await prisma.request.update({
            where: { id: req.params.id },
            data: { status: RequestStatus.REJECTED },
            include: {
                user: { select: { name: true, email: true, role: true } },
                department: { select: { name: true } }
            }
        });

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
        const filter: any = {};


        if (req.user.departmentId) {
            filter.departmentId = req.user.departmentId;
        }

        if (req.query.status) {
            filter.status = req.query.status as string;
        }

        const { page, limit, skip, take } = getPaginationParams(req.query);

        const [total, requests] = await Promise.all([
            prisma.request.count({ where: filter }),
            prisma.request.findMany({
                where: filter,
                include: getRequestInclude(),
                orderBy: { createdAt: 'desc' },
                skip,
                take
            })
        ]);

        res.status(200).json({
            success: true,
            message: 'Department requests retrieved successfully',
            data: createPaginatedResponse(requests, total, page, limit)
        });
    } catch (error) {
        next(error);
    }
};
