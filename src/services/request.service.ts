import prisma from '../utils/prisma';
import { RequestStatus } from '../types/request.interface';
import { getRequestInclude, getAdminFallback } from '../utils/queryHelpers';

export class RequestService {

    static async createRequest(data: {
        userId: string;
        departmentId: string;
        title: string;
        resourceName: string;
        resourceType: string;
        description?: string;
        quantity: number;
        estimatedCost: number;
        priority?: string;
        userRole?: string; // Add user role to determine initial status
    }) {
        // If requester is a MANAGER, skip manager approval and go directly to SEMI_APPROVED
        // This means only ADMIN needs to approve manager requests
        const initialStatus = data.userRole === 'MANAGER'
            ? RequestStatus.SEMI_APPROVED
            : RequestStatus.SUBMITTED;

        const request = await prisma.request.create({
            data: {
                userId: data.userId,
                departmentId: data.departmentId,
                title: data.title,
                resourceName: data.resourceName,
                resourceType: data.resourceType,
                description: data.description,
                quantity: data.quantity,
                estimatedCost: data.estimatedCost,
                priority: data.priority as any,
                status: initialStatus
            },
            include: getRequestInclude()
        });

        // Fallback to admin if no managers
        if (!(request.department as any).managers || (request.department as any).managers.length === 0) {
            const admin = await getAdminFallback(prisma);
            if (admin && request.department) {
                (request.department as any).managers = [{ user: { name: admin.name } }];
            }
        }

        return request;
    }

    static async getMyRequests(
        userId: string,
        filters: { status?: string },
        pagination: { skip: number; take: number }
    ) {
        const { skip, take } = pagination;
        const filter: any = { userId };

        if (filters.status) {
            filter.status = filters.status;
        }

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

        return { requests, total };
    }

    static async getAllRequests(
        filters: {
            status?: string;
            departmentId?: string;
        },
        pagination: { skip: number; take: number },
        userRole: string,
        userDepartmentId: string
    ) {
        const { skip, take } = pagination;
        const filter: any = {};

        // Role-based filtering
        if (userRole === 'MANAGER') {
            filter.departmentId = userDepartmentId;
        }

        if (filters.status) {
            filter.status = filters.status;
        }

        if (filters.departmentId) {
            filter.departmentId = filters.departmentId;
        }

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

        return { requests, total };
    }

    static async getRequestById(id: string) {
        const [request, admin] = await Promise.all([
            prisma.request.findUnique({
                where: { id },
                include: getRequestInclude()
            }),
            getAdminFallback(prisma)
        ]);

        if (request && (!(request.department as any).managers || (request.department as any).managers.length === 0) && admin) {
            (request.department as any).managers = [{ user: { name: admin.name } }];
        }

        return request;
    }

    static checkPermission(
        request: any,
        user: { id: string; role: string; departmentId: string }
    ): boolean {
        const isOwner = request.userId === user.id;
        const isManagerOfDept = user.role === 'MANAGER' && request.departmentId === user.departmentId;
        const isAdmin = user.role === 'ADMIN';
        const isFinance = user.role === 'finance';

        return isOwner || isManagerOfDept || isAdmin || isFinance;
    }

    static validateStatusTransition(currentStatus: string, action: 'update' | 'delete' | 'submit' | 'cancel'): {
        allowed: boolean;
        message?: string;
    } {
        const statusMap: any = {
            update: [RequestStatus.DRAFT, RequestStatus.SUBMITTED, RequestStatus.REJECTED],
            delete: [RequestStatus.DRAFT, RequestStatus.SUBMITTED, RequestStatus.REJECTED],
            submit: [RequestStatus.DRAFT, RequestStatus.REJECTED],
            cancel: [RequestStatus.DRAFT, RequestStatus.SUBMITTED, RequestStatus.SEMI_APPROVED]
        };

        const allowedStatuses = statusMap[action] || [];

        if (!allowedStatuses.includes(currentStatus)) {
            return {
                allowed: false,
                message: `Cannot ${action} request with status: ${currentStatus}`
            };
        }

        return { allowed: true };
    }

    static async updateRequest(
        id: string,
        data: {
            title?: string;
            resourceName?: string;
            resourceType?: string;
            description?: string;
            quantity?: number;
            estimatedCost?: number;
            priority?: string;
        },
        currentStatus: string
    ) {
        let dataToUpdate: any = {};

        // If submitted, only allow description updates
        if (currentStatus === RequestStatus.SUBMITTED) {
            if (data.description !== undefined) {
                dataToUpdate.description = data.description;
            }
        } else {
            // For draft or rejected, allow all fields
            dataToUpdate = {
                title: data.title,
                resourceName: data.resourceName,
                resourceType: data.resourceType,
                description: data.description,
                quantity: data.quantity,
                estimatedCost: data.estimatedCost,
                priority: data.priority
            };
        }

        return await prisma.request.update({
            where: { id },
            data: dataToUpdate,
            include: {
                user: { select: { name: true, email: true, role: true } },
                department: { select: { name: true, code: true } }
            }
        });
    }

    static async deleteRequest(id: string) {
        return await prisma.request.delete({
            where: { id }
        });
    }

    static async submitRequest(id: string) {
        return await prisma.request.update({
            where: { id },
            data: { status: RequestStatus.SUBMITTED },
            include: {
                user: { select: { name: true, email: true, role: true } },
                department: { select: { name: true } }
            }
        });
    }

    static async cancelRequest(id: string) {
        return await prisma.request.update({
            where: { id },
            data: { status: RequestStatus.REJECTED },
            include: {
                user: { select: { name: true, email: true, role: true } },
                department: { select: { name: true } }
            }
        });
    }

    static async getDepartmentRequests(
        departmentId: string,
        filters: { status?: string },
        pagination: { skip: number; take: number }
    ) {
        const { skip, take } = pagination;
        const filter: any = { departmentId };

        if (filters.status) {
            filter.status = filters.status;
        }

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

        return { requests, total };
    }
}
