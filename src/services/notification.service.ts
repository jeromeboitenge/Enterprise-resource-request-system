import prisma from '../utils/prisma';
import { NotificationType } from '../types/notification.interface';
import { Roles } from '../types/user.interface';
import logger from '../utils/logger';

export class NotificationService {

    static async create(data: {
        userId: string;
        type: NotificationType;
        title: string;
        message: string;
        relatedId?: string;
    }) {
        try {


            return await prisma.notification.create({
                data: {
                    userId: data.userId,
                    type: data.type,
                    title: data.title,
                    message: data.message,

                }
            });
        } catch (error) {
            logger.error('Notification creation failed:', error);
            return null;
        }
    }

    static async createBulk(userIds: string[], data: {
        type: NotificationType;
        title: string;
        message: string;
        relatedId?: string;
    }) {
        const notifications = userIds.map(userId => ({
            userId,
            type: data.type,
            title: data.title,
            message: data.message
        }));

        try {
            return await prisma.notification.createMany({
                data: notifications
            });
        } catch (error) {
            logger.error('Bulk notification creation failed:', error);
            return [];
        }
    }

    static async notifyByRole(roles: Roles[], data: {
        type: NotificationType;
        title: string;
        message: string;
        relatedId?: string;
    }) {

        const users = await prisma.user.findMany({
            where: {
                role: { in: roles },
                isActive: true
            },
            select: { id: true }
        });
        const userIds = users.map(user => user.id);
        return await this.createBulk(userIds, data);
    }

    static async getUserNotifications(userId: string, options: {
        isRead?: boolean;
        page?: number;
        limit?: number;
    } = {}) {
        const { isRead, page = 1, limit = 20 } = options;

        const where: any = { userId };
        if (isRead !== undefined) {
            where.isRead = isRead;
        }

        const skip = (page - 1) * limit;

        const notifications = await prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        });

        const total = await prisma.notification.count({ where });
        const unreadCount = await prisma.notification.count({
            where: { userId, isRead: false }
        });

        return {
            notifications,
            unreadCount,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    static async markAsRead(notificationId: string, userId: string) {


        const count = await prisma.notification.updateMany({
            where: { id: notificationId, userId },
            data: { isRead: true }
        });

        if (count.count === 0) return null;

        return await prisma.notification.findUnique({ where: { id: notificationId } });
    }

    static async markAllAsRead(userId: string) {
        return await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });
    }

    static async delete(notificationId: string, userId: string) {
        // Check ownership
        const notification = await prisma.notification.findFirst({
            where: { id: notificationId, userId }
        });

        if (!notification) return null;

        return await prisma.notification.delete({
            where: { id: notificationId }
        });
    }
}
