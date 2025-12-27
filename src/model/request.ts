import mongoose, { Schema, Document } from 'mongoose';
import { ResourceRequestInterface, RequestStatus, Priority } from '../types/request.interface';

export interface RequestDocument extends ResourceRequestInterface, Document { }

const RequestSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
        title: { type: String, required: true },
        resourceName: { type: String, required: true },
        resourceType: { type: String, required: true },
        description: { type: String },
        quantity: { type: Number, required: true, min: 1 },
        estimatedCost: { type: Number, required: true, min: 0 },
        priority: { type: String, enum: Object.values(Priority), default: Priority.Medium },
        status: { type: String, enum: Object.values(RequestStatus), default: RequestStatus.Draft }
    },
    { timestamps: true }
);

export default mongoose.model<RequestDocument>('ResourceRequest', RequestSchema);
