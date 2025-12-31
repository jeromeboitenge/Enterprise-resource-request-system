import Notification from '../model/notification';
import { NotificationType } from '../types/notification.interface';
import User from '../model/user';
import { Roles } from '../types/user.interface';
import logger from '../utils/logger';

export class NotificationService {
    /**
     * Create a notification
     */
    static async create(data: {
        userId: string;
        type: NotificationType;
        title: string;
        message: string;
        relatedId?: string;
    }) {
        try {
            return await Notification.create(data);
        } catch (error) {
            logger.error('Notification creation failed:', error);
            return null;
        }
    }

    /**
     * Create notifications for multiple users
     */
    static async createBulk(userIds: string[], data: {
        type: NotificationType;
        title: string;
        message: string;
        relatedId?: string;
    }) {
        const notifications = userIds.map(userId => ({
            userId,
            ...data
        }));

        try {
            return await Notification.insertMany(notifications);
        } catch (error) {
            logger.error('Bulk notification creation failed:', error);
            return [];
        }
    }

    /**
     * Notify users by role
     */
    static async notifyByRole(roles: Roles[], data: {
        type: NotificationType;
        title: string;
        message: string;
        relatedId?: string;
    }) {
        const users = await User.find({ role: { $in: roles }, isActive: true }).select('_id');
        const userIds = users.map(user => user._id.toString());
        return await this.createBulk(userIds, data);
    }

    /**
     * Get user notifications
     */
    static async getUserNotifications(userId: string, options: {
        isRead?: boolean;
        page?: number;
        limit?: number;
    } = {}) {
        const { isRead, page = 1, limit = 20 } = options;

        const query: any = { userId };
        if (isRead !== undefined) {
            query.isRead = isRead;
        }

        const skip = (page - 1) * limit;

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({ userId, isRead: false });

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

    /**
     * Mark notification as read
     */
    static async markAsRead(notificationId: string, userId: string) {
        return await Notification.findOneAndUpdate(
            { _id: notificationId, userId },
            { isRead: true },
            { new: true }
        );
    }

    /**
     * Mark all notifications as read
     */
    static async markAllAsRead(userId: string) {
        return await Notification.updateMany(
            { userId, isRead: false },
            { isRead: true }
        );
    }

    /**
     * Delete notification
     */
    static async delete(notificationId: string, userId: string) {
        return await Notification.findOneAndDelete({ _id: notificationId, userId });
    }
}
