// Updated to match Prisma schema
export enum NotificationType {
    INFO = 'INFO',
    WARNING = 'WARNING',
    ERROR = 'ERROR'
}

export interface NotificationInterface {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    relatedId?: string;
    isRead: boolean;
    createdAt: Date;
}
