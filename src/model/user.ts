import mongoose, { Schema, Document } from 'mongoose';
import { UserInterface, Roles } from '../types/user.interface';

export interface UserDocument extends UserInterface, Document { }

const UserSchema: Schema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },
        role: { type: String, enum: Object.values(Roles), required: true },
        department: { type: String, required: true }
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<UserDocument>('User', UserSchema);
