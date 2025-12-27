import mongoose, { Schema, Document } from 'mongoose';
import { NotificationInterface, NotificationType } from '../types/notification.interface';

export interface NotificationDocument extends NotificationInterface, Document { }

const NotificationSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, enum: Object.values(NotificationType), required: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        relatedId: { type: String },
        isRead: { type: Boolean, default: false }
    },
    {
        timestamps: { createdAt: true, updatedAt: false }
    }
);

// Index for faster queries
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model<NotificationDocument>('Notification', NotificationSchema);
