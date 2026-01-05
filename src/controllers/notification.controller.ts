import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { isRead, page, limit } = req.query;

        const result = await NotificationService.getUserNotifications(
            req.user._id.toString(),
            {
                isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined
            }
        );

        res.status(200).json({
            success: true,
            message: 'Notifications retrieved successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notification = await NotificationService.markAsRead(
            req.params.id,
            req.user._id.toString()
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: { notification }
        });
    } catch (error) {
        next(error);
    }
};

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await NotificationService.markAllAsRead(req.user._id.toString());

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read',
            data: null
        });
    } catch (error) {
        next(error);
    }
};

export const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notification = await NotificationService.delete(
            req.params.id,
            req.user._id.toString()
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully',
            data: null
        });
    } catch (error) {
        next(error);
    }
};
