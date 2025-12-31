import mongoose, { Schema, Document } from 'mongoose';
import { UserInterface, Roles } from '../types/user.interface';

export interface UserDocument extends UserInterface, Document {
    isLocked: boolean;
    incLoginAttempts(): Promise<void>;
    resetLoginAttempts(): Promise<void>;
}

const UserSchema: Schema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },
        role: { type: String, enum: Object.values(Roles), default: 'employee' },
        department: { type: String },
        isActive: { type: Boolean, default: true },

        // Account security fields
        loginAttempts: { type: Number, default: 0 },
        lockUntil: { type: Date },
        refreshToken: { type: String }
    },
    { timestamps: true }
);

// Virtual property to check if account is locked
UserSchema.virtual('isLocked').get(function (this: UserDocument) {
    // Check if lockUntil exists and is in the future
    return !!(this.lockUntil && this.lockUntil > new Date());
});

// Method to increment login attempts
UserSchema.methods.incLoginAttempts = async function (this: UserDocument) {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < new Date()) {
        return this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        });
    }

    // Otherwise increment
    const updates: any = { $inc: { loginAttempts: 1 } };

    // Lock the account if we've reached max attempts (5)
    const maxAttempts = 5;
    const lockTime = 15 * 60 * 1000; // 15 minutes
    const currentAttempts = this.loginAttempts ?? 0;

    if (currentAttempts + 1 >= maxAttempts && !this.isLocked) {
        updates.$set = { lockUntil: new Date(Date.now() + lockTime) };
    }

    return this.updateOne(updates);
};

// Method to reset login attempts
UserSchema.methods.resetLoginAttempts = async function (this: UserDocument) {
    return this.updateOne({
        $set: { loginAttempts: 0 },
        $unset: { lockUntil: 1 }
    });
};

export default mongoose.model<UserDocument>('User', UserSchema);

