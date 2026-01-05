import mongoose, { Schema, Document } from 'mongoose';
import { AuditLogInterface, AuditAction } from '../types/auditLog.interface';

export interface AuditLogDocument extends AuditLogInterface, Document { }

const AuditLogSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        userRole: { type: String, required: true },
        action: { type: String, enum: Object.values(AuditAction), required: true },
        resource: { type: String, required: true },
        resourceId: { type: String },
        details: { type: Schema.Types.Mixed },
        ipAddress: { type: String },
        timestamp: { type: Date, default: Date.now, immutable: true }
    },
    {
        timestamps: false
    }
);

AuditLogSchema.pre('save', function (next) {
    if (!this.isNew) {
        throw new Error('Audit logs cannot be modified');
    }
    next();
});

export default mongoose.model<AuditLogDocument>('AuditLog', AuditLogSchema);
