import mongoose, { Schema, Document } from 'mongoose';
import { UserInterface, Roles } from '../types/user.interface';

export interface UserDocument extends UserInterface, Document {

    isLocked: boolean;

    incLoginAttempts(): Promise<void>;

    resetLoginAttempts(): Promise<void>;
}

const UserSchema: Schema = new Schema(
    {

        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },

        password: {
            type: String,
            required: true,
            select: false // Don't include in queries by default
        },

        role: {
            type: String,
            enum: Object.values(Roles),
            default: 'employee'
        },

        department: {
            type: String
        },

        isActive: {
            type: Boolean,
            default: true
        },

        loginAttempts: {
            type: Number,
            default: 0,
            select: false // Don't include in queries by default
        },

        lockUntil: {
            type: Date,
            select: false // Don't include in queries by default
        },

        refreshToken: {
            type: String,
            select: false // Don't include in queries by default
        },

        lastLogin: {
            type: Date
        }
    },
    {

        timestamps: true
    }
);

UserSchema.virtual('isLocked').get(function (this: UserDocument) {

    return !!(this.lockUntil && this.lockUntil > new Date());
});

UserSchema.methods.incLoginAttempts = async function (this: UserDocument) {

    if (this.lockUntil && this.lockUntil < new Date()) {
        return this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        });
    }

    const updates: any = { $inc: { loginAttempts: 1 } };

    const maxAttempts = 5;
    const lockTime = 15 * 60 * 1000; // 15 minutes
    const currentAttempts = this.loginAttempts ?? 0;

    if (currentAttempts + 1 >= maxAttempts && !this.isLocked) {
        updates.$set = { lockUntil: new Date(Date.now() + lockTime) };
    }

    return this.updateOne(updates);
};

UserSchema.methods.resetLoginAttempts = async function (this: UserDocument) {
    return this.updateOne({
        $set: { loginAttempts: 0 },
        $unset: { lockUntil: 1 }
    });
};

UserSchema.index({ email: 1 });

UserSchema.index({ role: 1 });

UserSchema.index({ department: 1, role: 1 });

export default mongoose.model<UserDocument>('User', UserSchema);

