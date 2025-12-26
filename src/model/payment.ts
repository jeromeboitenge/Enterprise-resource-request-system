import mongoose, { Schema, Document } from 'mongoose';
import { PaymentInterface, PaymentMethod } from '../types/payment.interface';

export interface PaymentDocument extends PaymentInterface, Document { }

const PaymentSchema: Schema = new Schema({
    requestId: { type: Schema.Types.ObjectId, ref: 'ResourceRequest', required: true },
    financeOfficerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amountPaid: { type: Number, required: true },
    paymentMethod: { type: String, enum: Object.values(PaymentMethod), required: true },
    paymentDate: { type: Date, default: Date.now }
});

export default mongoose.model<PaymentDocument>('Payment', PaymentSchema);
