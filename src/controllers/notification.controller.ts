import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Get user notifications
 * @route GET /api/v1/notifications
 * @access Private
 */
export const getNotifications = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { isRead, page, limit } = req.query;

        const result = await NotificationService.getUserNotifications(
            req.user._id.toString(),
            {
                isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined
            }
        );

        ApiResponse.success('Notifications retrieved successfully', result).send(res);
    }
);

/**
 * Mark notification as read
 * @route PUT /api/v1/notifications/:id/read
 * @access Private
 */
export const markAsRead = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const notification = await NotificationService.markAsRead(
            req.params.id,
            req.user._id.toString()
        );

        if (!notification) {
            throw ApiError.notFound('Notification not found');
        }

        ApiResponse.success('Notification marked as read', { notification }).send(res);
    }
);

/**
 * Mark all notifications as read
 * @route PUT /api/v1/notifications/read-all
 * @access Private
 */
export const markAllAsRead = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        await NotificationService.markAllAsRead(req.user._id.toString());
        ApiResponse.success('All notifications marked as read', null).send(res);
    }
);

/**
 * Delete notification
 * @route DELETE /api/v1/notifications/:id
 * @access Private
 */
export const deleteNotification = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const notification = await NotificationService.delete(
            req.params.id,
            req.user._id.toString()
        );

        if (!notification) {
            throw ApiError.notFound('Notification not found');
        }

        ApiResponse.success('Notification deleted successfully', null).send(res);
    }
);
