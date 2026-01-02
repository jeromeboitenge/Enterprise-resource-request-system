import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { responseService } from '../utils/ResponseService';
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

        return responseService.response({
            res,
            data: result,
            message: 'Notifications retrieved successfully',
            statusCode: 200
        });
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

        return responseService.response({
            res,
            data: { notification },
            message: 'Notification marked as read',
            statusCode: 200
        });
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

        return responseService.response({
            res,
            data: null,
            message: 'All notifications marked as read',
            statusCode: 200
        });
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

        return responseService.response({
            res,
            data: null,
            message: 'Notification deleted successfully',
            statusCode: 200
        });
    }
);
