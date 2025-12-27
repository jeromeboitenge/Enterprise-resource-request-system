export enum NotificationType {
    REQUEST_SUBMITTED = 'request_submitted',
    REQUEST_APPROVED = 'request_approved',
    REQUEST_REJECTED = 'request_rejected',
    APPROVAL_REQUIRED = 'approval_required',
    PAYMENT_PROCESSED = 'payment_processed',
    REQUEST_FUNDED = 'request_funded',
    REQUEST_FULFILLED = 'request_fulfilled',
    REQUEST_CANCELLED = 'request_cancelled'
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
