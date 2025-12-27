import mongoose, { Schema, Document } from 'mongoose';
import { ApprovalInterface, ApprovalDecision, ApprovalLevel } from '../types/approval.interface';

export interface ApprovalDocument extends ApprovalInterface, Document { }

const ApprovalSchema: Schema = new Schema({
    requestId: { type: Schema.Types.ObjectId, ref: 'ResourceRequest', required: true },
    approverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approverRole: { type: String, required: true },
    level: { type: Number, enum: Object.values(ApprovalLevel), required: true },
    decision: { type: String, enum: Object.values(ApprovalDecision), default: ApprovalDecision.Pending },
    comment: { type: String },
    decisionDate: { type: Date, default: Date.now }
});

export default mongoose.model<ApprovalDocument>('Approval', ApprovalSchema);
