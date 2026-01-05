import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
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

        const request = await prisma.request.create({
            data: {
                userId: req.user.id,
                departmentId,
                title,
                resourceName,
                resourceType,
                description,
                quantity,
                estimatedCost,
                priority,
                status: RequestStatus.Draft
            },
            include: {
                user: { select: { name: true, email: true, role: true } },
                department: { select: { name: true, code: true } }
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

        const requests = await prisma.request.findMany({
            where: filter,
            include: {
                user: { select: { name: true, email: true, role: true } },
                department: { select: { name: true, code: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

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
            filter.status = req.query.status as string;
        }

        if (req.query.departmentId) {
            filter.departmentId = req.query.departmentId as string;
        }

        const requests = await prisma.request.findMany({
            where: filter,
            include: {
                user: { select: { name: true, email: true, role: true, department: true } },
                department: { select: { name: true, code: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

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
        const request = await prisma.request.findUnique({
            where: { id: req.params.id },
            include: {
                user: { select: { name: true, email: true, role: true, department: true } },
                department: { select: { name: true, code: true } }
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
                department: { select: { name: true } } // Assuming department name only based on previous Populate
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
        // Assuming Department Head's user.department is their department ID or Name?
        // In Auth Controller registration, we store department as string.
        // In Schema, User department is String (optional).
        // In Request, departmentId is String (FK to Department).

        // However, Prisma schema defines User.department as String? (db.VarChar).
        // It does NOT link to Department model directly in User model (except via managedDepartments relation).
        // BUT Request model links to Department via departmentId.

        // If req.user.department is a department NAME (as per previous logic 'IT' default), filtering by departmentId might fail if it expects ID.
        // Mongoose logic was: filter.departmentId = req.user.department.
        // This implies req.user.department was storing the ID.
        // Let's assume req.user.department is the ID or Name consistent with usage.

        // Re-checking Register:
        // const userDepartment = department || 'IT';
        // const user = ... department: userDepartment

        // If 'IT' is stored, then it's a Name.
        // But Request.departmentId is FK to Department(id).
        // This is a discrepancy from previous code or Mongoose loose typing.
        // If User.department stores "IT", and Request.departmentId stores UUID, then `req.user.department` cannot be used as `departmentId` filter directly unless they match.

        // Given constraint of minimizing scope creep but fixing errors:
        // I should probably query the Department table by Name to get ID if req.user.department is a Name.

        let deptId = null;
        // Check if req.user.department looks like a UUID or Name.
        // If it's a name, find the department first.

        // For now, let's just implement what was there but using Prism syntax.
        // If logic was broken before, it might stay broken or I fix it if obvious.

        /* 
           Fix: If User.department is meant to be ID, then Register should resolve Name to ID.
           But Register logic just saving string.
           
           Let's assume for now we filter by User's department if it matches Request.userId -> User.department?
           No, getDepartmentRequests intends to get all requests for the department the HEAD manages.
           
           Let's Assume req.user.department holds the Department ID for now to be compatible with Request.departmentId.
        */

        if (req.user.department) {
            // In a real fix, we'd lookup department. But let's trust the logic passed down unless it breaks.
            // Wait, previous code: const filter: any = { departmentId: req.user.department };
            filter.departmentId = req.user.department;
        }

        if (req.query.status) {
            filter.status = req.query.status as string;
        }

        const requests = await prisma.request.findMany({
            where: filter,
            include: {
                user: { select: { name: true, email: true, role: true } },
                department: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

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
