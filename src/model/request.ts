import mongoose, { Schema, Document } from 'mongoose';
import { ResourceRequestInterface, RequestStatus } from '../types/request.interface';

export interface RequestDocument extends ResourceRequestInterface, Document { }

const RequestSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
        resourceName: { type: String, required: true },
        description: { type: String },
        amountRequested: { type: Number, required: true },
        status: { type: String, enum: Object.values(RequestStatus), default: RequestStatus.Pending }
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<RequestDocument>('ResourceRequest', RequestSchema);
