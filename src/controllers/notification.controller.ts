import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';

/**
 * ============================================
 * GET USER NOTIFICATIONS
 * ============================================
 * 
 * This function gets all notifications for the current user.
 * Can filter by read/unread status and paginate results.
 * 
 * Steps:
 * 1. Get filter parameters from query
 * 2. Call notification service to get notifications
 * 3. Send response with notifications
 */
export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Step 1: Get filter parameters from query
        const { isRead, page, limit } = req.query;

        // Step 2: Get user notifications from service
        const result = await NotificationService.getUserNotifications(
            req.user._id.toString(),
            {
                isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined
            }
        );

        // Step 3: Send response
        res.status(200).json({
            success: true,
            message: 'Notifications retrieved successfully',
            data: result
        });

    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};

/**
 * ============================================
 * MARK NOTIFICATION AS READ
 * ============================================
 * 
 * This function marks a single notification as read.
 * User can only mark their own notifications.
 * 
 * Steps:
 * 1. Get notification ID from URL
 * 2. Mark notification as read using service
 * 3. Send response with updated notification
 */
export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Step 1: Mark notification as read
        const notification = await NotificationService.markAsRead(
            req.params.id,
            req.user._id.toString()
        );

        // Step 2: Check if notification was found
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        // Step 3: Send response
        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: { notification }
        });

    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};

/**
 * ============================================
 * MARK ALL NOTIFICATIONS AS READ
 * ============================================
 * 
 * This function marks all user's notifications as read.
 * 
 * Steps:
 * 1. Call service to mark all notifications as read
 * 2. Send success response
 */
export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Step 1: Mark all notifications as read for current user
        await NotificationService.markAllAsRead(req.user._id.toString());

        // Step 2: Send success response
        res.status(200).json({
            success: true,
            message: 'All notifications marked as read',
            data: null
        });

    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};

/**
 * ============================================
 * DELETE NOTIFICATION
 * ============================================
 * 
 * This function deletes a notification.
 * User can only delete their own notifications.
 * 
 * Steps:
 * 1. Get notification ID from URL
 * 2. Delete notification using service
 * 3. Send success response
 */
export const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Step 1: Delete notification
        const notification = await NotificationService.delete(
            req.params.id,
            req.user._id.toString()
        );

        // Step 2: Check if notification was found
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        // Step 3: Send success response
        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully',
            data: null
        });

    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};
