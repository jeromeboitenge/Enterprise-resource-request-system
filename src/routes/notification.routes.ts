import { Router } from 'express';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} from '../controllers/notification.controller';
import { authenticate } from '../auth/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);

router.put('/read-all', markAllAsRead);

router.put('/:id/read', markAsRead);

router.delete('/:id', deleteNotification);

export default router;
