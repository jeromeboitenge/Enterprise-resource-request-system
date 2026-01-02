import mongoose, { Schema, Document } from 'mongoose';
import { UserInterface, Roles } from '../types/user.interface';

/**
 * User Document Interface
 * 
 * Extends the base UserInterface with Mongoose Document methods and custom methods
 * for account security management.
 */
export interface UserDocument extends UserInterface, Document {
    /**
     * Virtual property that checks if the account is currently locked
     * Returns true if lockUntil exists and is in the future
     */
    isLocked: boolean;

    /**
     * Increments the login attempt counter and locks the account if max attempts reached
     * 
     * @returns Promise that resolves when the update is complete
     * 
     * @example
     * ```typescript
     * await user.incLoginAttempts();
     * ```
     */
    incLoginAttempts(): Promise<void>;

    /**
     * Resets the login attempt counter and removes account lock
     * Called after successful login
     * 
     * @returns Promise that resolves when the update is complete
     * 
     * @example
     * ```typescript
     * await user.resetLoginAttempts();
     * ```
     */
    resetLoginAttempts(): Promise<void>;
}

/**
 * User Schema
 * 
 * Defines the structure and validation rules for user documents in MongoDB.
 * Includes fields for authentication, authorization, and account security.
 */
const UserSchema: Schema = new Schema(
    {
        /**
         * User's full name
         * @required
         */
        name: {
            type: String,
            required: true,
            trim: true
        },

        /**
         * User's email address (used for login)
         * Must be unique across all users
         * Automatically converted to lowercase
         * @required
         * @unique
         */
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },

        /**
         * User's hashed password
         * Never returned in API responses (use .select('-password'))
         * @required
         * @private
         */
        password: {
            type: String,
            required: true,
            select: false // Don't include in queries by default
        },

        /**
         * User's role in the system
         * Determines access permissions and available features
         * @default 'employee'
         */
        role: {
            type: String,
            enum: Object.values(Roles),
            default: 'employee'
        },

        /**
         * Department the user belongs to
         * Optional field for organizational structure
         */
        department: {
            type: String
        },

        /**
         * Whether the user account is active
         * Inactive accounts cannot log in
         * @default true
         */
        isActive: {
            type: Boolean,
            default: true
        },

        // ============================================
        // Account Security Fields
        // ============================================

        /**
         * Number of consecutive failed login attempts
         * Resets to 0 after successful login
         * Account locks after 5 failed attempts
         * @default 0
         * @private
         */
        loginAttempts: {
            type: Number,
            default: 0,
            select: false // Don't include in queries by default
        },

        /**
         * Timestamp until which the account is locked
         * Account automatically unlocks after this time
         * @private
         */
        lockUntil: {
            type: Date,
            select: false // Don't include in queries by default
        },

        /**
         * Refresh token for JWT token rotation (future enhancement)
         * @private
         */
        refreshToken: {
            type: String,
            select: false // Don't include in queries by default
        },

        /**
         * Timestamp of the user's last successful login
         * Useful for security auditing and inactive account detection
         */
        lastLogin: {
            type: Date
        }
    },
    {
        /**
         * Automatically add createdAt and updatedAt timestamps
         */
        timestamps: true
    }
);

// ============================================
// Virtual Properties
// ============================================

/**
 * Virtual property to check if account is locked
 * 
 * An account is considered locked if:
 * - lockUntil field exists
 * - lockUntil is in the future
 * 
 * @returns {boolean} True if account is locked, false otherwise
 */
UserSchema.virtual('isLocked').get(function (this: UserDocument) {
    // Check if lockUntil exists and is in the future
    return !!(this.lockUntil && this.lockUntil > new Date());
});

// ============================================
// Instance Methods
// ============================================

/**
 * Increments login attempts and locks account if max attempts reached
 * 
 * Logic:
 * 1. If previous lock has expired, reset to 1 attempt
 * 2. Otherwise, increment attempt counter
 * 3. If attempts reach 5, lock account for 15 minutes
 * 
 * @this {UserDocument}
 * @returns {Promise<void>}
 */
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

/**
 * Resets login attempts and removes account lock
 * 
 * Called after successful login to reset security counters
 * 
 * @this {UserDocument}
 * @returns {Promise<void>}
 */
UserSchema.methods.resetLoginAttempts = async function (this: UserDocument) {
    return this.updateOne({
        $set: { loginAttempts: 0 },
        $unset: { lockUntil: 1 }
    });
};

// ============================================
// Indexes
// ============================================

/**
 * Index on email for faster lookups during login
 * Email is unique, so this also enforces uniqueness
 */
UserSchema.index({ email: 1 });

/**
 * Index on role for faster role-based queries
 */
UserSchema.index({ role: 1 });

/**
 * Compound index for department and role queries
 */
UserSchema.index({ department: 1, role: 1 });

export default mongoose.model<UserDocument>('User', UserSchema);


