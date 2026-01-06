import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { RequestStatus } from '../types/request.interface';
import { getPaginationParams, createPaginatedResponse } from '../utils/pagination';

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
                status: RequestStatus.Submitted
            },
            include: {
                user: { select: { name: true, email: true, role: true } },
                department: {
                    select: {
                        name: true,
                        code: true,
                        manager: { select: { name: true } }
                    }
                }
            }
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

export const getMyRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filter: any = { userId: req.user.id };

        if (req.query.status) {
            filter.status = req.query.status as string;
        }

        const { page, limit, skip, take } = getPaginationParams(req.query);

        const [total, requests] = await Promise.all([
            prisma.request.count({ where: filter }),
            prisma.request.findMany({
                where: filter,
                include: {
                    user: { select: { name: true, email: true, role: true } },
                    department: {
                        select: {
                            name: true,
                            code: true,
                            manager: { select: { name: true } }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            })
        ]);

        res.status(200).json({
            success: true,
            message: 'Requests retrieved successfully',
            data: createPaginatedResponse(requests, total, page, limit)
        });
    } catch (error) {
        next(error);
    }
};

export const getAllRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filter: any = {};
        const { role, departmentId } = req.user;

        if (role === 'manager' || role === 'departmenthead') {
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

        const [total, requests] = await Promise.all([
            prisma.request.count({ where: filter }),
            prisma.request.findMany({
                where: filter,
                include: {
                    user: { select: { name: true, email: true, role: true, department: true } },
                    department: {
                        select: {
                            name: true,
                            code: true,
                            manager: { select: { name: true } }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            })
        ]);

        res.status(200).json({
            success: true,
            message: 'Requests retrieved successfully',
            data: createPaginatedResponse(requests, total, page, limit)
        });
    } catch (error) {
        next(error);
    }
};

export const getRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const request = await prisma.request.findUnique({
            where: { id: req.params.id },
            include: {
                user: { select: { name: true, email: true, role: true, department: true } },
                department: {
                    select: {
                        name: true,
                        code: true,
                        manager: { select: { name: true } }
                    }
                }
            }
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: `Request not found with ID: ${req.params.id}`
            });
        }

        const isOwner = request.userId === req.user.id;
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
                message: 'You can only update your own requests'
            });
        }

        const allowedStatuses = [RequestStatus.Draft, RequestStatus.Submitted];
        if (!allowedStatuses.includes(existingRequest.status as any)) {
            return res.status(400).json({
                success: false,
                message: `Cannot update request with status: ${existingRequest.status}. Only draft or submitted requests can be updated.`
            });
        }

        const request = await prisma.request.update({
            where: { id: req.params.id },
            data: {
                title,
                resourceName,
                resourceType,
                description,
                quantity,
                estimatedCost,
                priority
            },
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

        if (existingRequest.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own requests'
            });
        }

        const allowedStatuses = [RequestStatus.Draft, RequestStatus.Submitted];
        if (!allowedStatuses.includes(existingRequest.status as any)) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete request with status: ${existingRequest.status}. Only draft or submitted requests can be deleted.`
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

        if (existingRequest.status !== RequestStatus.Draft) {
            return res.status(400).json({
                success: false,
                message: `Cannot submit request with status: ${existingRequest.status}. Only draft requests can be submitted.`
            });
        }

        const request = await prisma.request.update({
            where: { id: req.params.id },
            data: { status: RequestStatus.Submitted },
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

        const allowedStatuses = [RequestStatus.Draft, RequestStatus.Submitted, RequestStatus.UnderReview];
        if (!allowedStatuses.includes(existingRequest.status as any)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel request with status: ${existingRequest.status}. Only draft, submitted, or under review requests can be cancelled.`
            });
        }

        const request = await prisma.request.update({
            where: { id: req.params.id },
            data: { status: RequestStatus.Cancelled },
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


        if (req.user.department) {
            filter.departmentId = req.user.department;
        }

        if (req.query.status) {
            filter.status = req.query.status as string;
        }

        const { page, limit, skip, take } = getPaginationParams(req.query);

        const [total, requests] = await Promise.all([
            prisma.request.count({ where: filter }),
            prisma.request.findMany({
                where: filter,
                include: {
                    user: { select: { name: true, email: true, role: true } },
                    department: { select: { name: true } }
                },
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
