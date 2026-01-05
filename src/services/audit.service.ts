import AuditLog from '../model/auditLog';
import { AuditAction } from '../types/auditLog.interface';
import logger from '../utils/logger';

export class AuditService {

    static async log(data: {
        userId: string;
        userRole: string;
        action: AuditAction;
        resource: string;
        resourceId?: string;
        details?: any;
        ipAddress?: string;
    }) {
        try {
            await AuditLog.create({
                ...data,
                timestamp: new Date()
            });
        } catch (error) {

            logger.error('Audit logging failed:', error);
        }
    }

    static async getLogs(filters: {
        userId?: string;
        action?: AuditAction;
        resource?: string;
        startDate?: Date;
        endDate?: Date;
        page?: number;
        limit?: number;
    }) {
        const {
            userId,
            action,
            resource,
            startDate,
            endDate,
            page = 1,
            limit = 50
        } = filters;

        const query: any = {};

        if (userId) query.userId = userId;
        if (action) query.action = action;
        if (resource) query.resource = resource;

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = startDate;
            if (endDate) query.timestamp.$lte = endDate;
        }

        const skip = (page - 1) * limit;

        const logs = await AuditLog.find(query)
            .populate('userId', 'name email role')
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit);

        const total = await AuditLog.countDocuments(query);

        return {
            logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
}
