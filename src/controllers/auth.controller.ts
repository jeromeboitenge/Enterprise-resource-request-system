import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../model/user';
import { config } from '../config';
import { ApiError } from '../utils/ApiError';
import { responseService } from '../utils/ResponseService';
import { asyncHandler } from '../utils/asyncHandler';
import { logSecurityEvent } from '../utils/logger';
import {
    ACCOUNT_LOCKOUT,
    HASHING,
    JWT_CONFIG,
    AUTH_MESSAGES,
    formatMessage,
} from '../constants';

/**
 * Register a New User
 * 
 * Creates a new user account with hashed password and generates a JWT token.
 * 
 * **Security Features**:
 * - Password is hashed using bcrypt with 12 salt rounds
 * - Email uniqueness is enforced at database level
 * - Password must meet complexity requirements (validated by Joi schema)
 * 
 * **Process**:
 * 1. Check if user with email already exists
 * 2. Hash the password using bcrypt
 * 3. Create user in database
 * 4. Generate JWT token
 * 5. Return user data (without password) and token
 * 
 * @route POST /api/v1/auth/register
 * @access Public
 * 
 * @param {string} req.body.name - User's full name (min 3 chars)
 * @param {string} req.body.email - User's email address (must be unique)
 * @param {string} req.body.password - User's password (min 8 chars, must include uppercase, lowercase, number, special char)
 * @param {string} req.body.confirmPassword - Password confirmation (must match password)
 * @param {string} [req.body.role='employee'] - User's role (employee, manager, departmenthead, finance, admin)
 * @param {string} [req.body.department] - User's department
 * 
 * @returns {Object} Response with user data and JWT token
 * @returns {Object} response.data.user - User object (without password)
 * @returns {string} response.data.token - JWT authentication token
 * 
 * @throws {ApiError} 409 - User with email already exists
 * @throws {ApiError} 400 - Validation error (handled by validate middleware)
 * 
 * @example
 * POST /api/v1/auth/register
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "password": "SecurePass123!",
 *   "confirmPassword": "SecurePass123!",
 *   "role": "employee",
 *   "department": "IT"
 * }
 */
export const register = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { name, email, password, role, department } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw ApiError.conflict(AUTH_MESSAGES.USER_EXISTS);
        }

        // Hash password using bcrypt with configured salt rounds
        const hashedPassword = await bcrypt.hash(password, HASHING.SALT_ROUNDS);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            department
        });

        // Generate JWT token with user ID and role
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            config.jwtSecret,
            { expiresIn: JWT_CONFIG.DEFAULT_EXPIRES_IN }
        );

        // Remove password from response
        const userResponse: any = user.toObject();
        delete userResponse.password;

        // Log successful registration
        logSecurityEvent('user_registered', req, {
            userId: user._id,
            email: user.email,
            role: user.role,
        });

        return responseService.response({
            res,
            data: {
                user: userResponse,
                token
            },
            message: AUTH_MESSAGES.REGISTER_SUCCESS,
            statusCode: 201
        });
    }
);

/**
 * Authenticate User and Generate Token
 * 
 * Authenticates a user with email and password, implementing comprehensive security measures.
 * 
 * **Security Features**:
 * - Account lockout after 5 failed attempts (15-minute duration)
 * - Password comparison using bcrypt
 * - Detailed attempt tracking with remaining attempts feedback
 * - Security event logging for audit trail
 * - Active account verification
 * 
 * **Account Lockout Logic**:
 * - Max attempts: 5 failed login attempts
 * - Lock duration: 15 minutes
 * - Auto-unlock: Account automatically unlocks after lock duration
 * - Attempt reset: Counter resets to 0 after successful login
 * 
 * @route POST /api/v1/auth/login
 * @access Public
 * 
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password (plain text)
 * 
 * @returns {Object} Response with user data and JWT token
 * @returns {Object} response.data.user - User object (without sensitive fields)
 * @returns {string} response.data.token - JWT authentication token (valid for 1 day)
 * 
 * @throws {ApiError} 401 - Invalid credentials
 * @throws {ApiError} 401 - Account locked (includes remaining lock time)
 * @throws {ApiError} 403 - Account deactivated
 * 
 * @example
 * POST /api/v1/auth/login
 * {
 *   "email": "john@example.com",
 *   "password": "SecurePass123!"
 * }
 */
export const login = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body;

        // Find user by email (include password and security fields)
        const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');
        if (!user) {
            // Log failed login attempt (user not found)
            logSecurityEvent('login_failed_user_not_found', req, { email });
            throw ApiError.unauthorized(AUTH_MESSAGES.INVALID_CREDENTIALS);
        }

        // Check if account is locked
        if (user.isLocked) {
            // Calculate remaining lock time in minutes
            const lockTimeRemaining = user.lockUntil
                ? Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000)
                : 0;

            // Log locked account login attempt
            logSecurityEvent('login_failed_account_locked', req, {
                email: user.email,
                userId: user._id,
                lockTimeRemaining,
            });

            throw ApiError.unauthorized(
                formatMessage(AUTH_MESSAGES.ACCOUNT_LOCKED, { minutes: lockTimeRemaining })
            );
        }

        // Verify password using bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            // Increment login attempts
            await user.incLoginAttempts();

            // Calculate remaining attempts before lockout
            const remainingAttempts = ACCOUNT_LOCKOUT.MAX_LOGIN_ATTEMPTS - (user.loginAttempts || 0) - 1;

            // Log failed login attempt
            logSecurityEvent('login_failed_invalid_password', req, {
                email: user.email,
                userId: user._id,
                remainingAttempts,
            });

            if (remainingAttempts > 0) {
                throw ApiError.unauthorized(
                    formatMessage(AUTH_MESSAGES.REMAINING_ATTEMPTS, { attempts: remainingAttempts })
                );
            } else {
                throw ApiError.unauthorized(AUTH_MESSAGES.ACCOUNT_LOCKED_GENERIC);
            }
        }

        // Check if user account is active
        if (!user.isActive) {
            logSecurityEvent('login_failed_account_deactivated', req, {
                email: user.email,
                userId: user._id,
            });
            throw ApiError.forbidden(AUTH_MESSAGES.ACCOUNT_DEACTIVATED);
        }

        // Reset login attempts on successful login
        if (user.loginAttempts && user.loginAttempts > 0) {
            await user.resetLoginAttempts();
        }

        // Update last login timestamp
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            config.jwtSecret,
            { expiresIn: JWT_CONFIG.DEFAULT_EXPIRES_IN }
        );

        // Remove sensitive fields from response
        const userResponse: any = user.toObject();
        delete userResponse.password;
        delete userResponse.loginAttempts;
        delete userResponse.lockUntil;
        delete userResponse.refreshToken;

        // Log successful login
        logSecurityEvent('login_successful', req, {
            email: user.email,
            userId: user._id,
            role: user.role,
        });

        return responseService.response({
            res,
            data: {
                user: userResponse,
                token
            },
            message: AUTH_MESSAGES.LOGIN_SUCCESS,
            statusCode: 200
        });
    }
);

/**
 * Get Current User Profile
 * 
 * Retrieves the authenticated user's profile information.
 * Requires valid JWT token in Authorization header.
 * 
 * @route GET /api/v1/auth/profile
 * @access Private (requires authentication)
 * 
 * @param {Request} req - Express request object (req.user populated by auth middleware)
 * 
 * @returns {Object} Response with user profile data
 * @returns {Object} response.data.user - User object (without password)
 * 
 * @throws {ApiError} 401 - Not authenticated (handled by auth middleware)
 * @throws {ApiError} 404 - User not found
 * 
 * @example
 * GET /api/v1/auth/profile
 * Headers: { Authorization: "Bearer <token>" }
 */
export const getProfile = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const user = await User.findById(req.user._id).select('-password');

        if (!user) {
            throw ApiError.notFound(AUTH_MESSAGES.USER_NOT_FOUND);
        }

        return responseService.response({
            res,
            data: { user },
            message: AUTH_MESSAGES.PROFILE_RETRIEVED,
            statusCode: 200
        });
    }
);

/**
 * Update User Profile
 * 
 * Updates the authenticated user's profile information (name and email).
 * Email uniqueness is enforced - cannot change to an email already in use.
 * 
 * @route PUT /api/v1/auth/profile
 * @access Private (requires authentication)
 * 
 * @param {string} [req.body.name] - Updated name
 * @param {string} [req.body.email] - Updated email (must be unique)
 * 
 * @returns {Object} Response with updated user data
 * @returns {Object} response.data.user - Updated user object (without password)
 * 
 * @throws {ApiError} 401 - Not authenticated (handled by auth middleware)
 * @throws {ApiError} 404 - User not found
 * @throws {ApiError} 409 - Email already in use
 * 
 * @example
 * PUT /api/v1/auth/profile
 * Headers: { Authorization: "Bearer <token>" }
 * {
 *   "name": "John Updated",
 *   "email": "john.updated@example.com"
 * }
 */
export const updateProfile = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { name, email } = req.body;

        // Check if email is being changed and if it's already taken
        if (email && email !== req.user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw ApiError.conflict(AUTH_MESSAGES.USER_EXISTS);
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, email },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            throw ApiError.notFound(AUTH_MESSAGES.USER_NOT_FOUND);
        }

        // Log profile update
        logSecurityEvent('profile_updated', req, {
            userId: user._id,
            changes: { name, email },
        });

        return responseService.response({
            res,
            data: { user },
            message: AUTH_MESSAGES.PROFILE_UPDATED,
            statusCode: 200
        });
    }
);

/**
 * Change User Password
 * 
 * Allows authenticated users to change their password.
 * Requires current password verification for security.
 * 
 * **Security Features**:
 * - Current password must be provided and verified
 * - New password must meet complexity requirements (validated by Joi schema)
 * - New password cannot be the same as current password
 * - Password is hashed using bcrypt with 12 salt rounds
 * - Security event logging for audit trail
 * - Rate limited to 3 attempts per hour (applied in routes)
 * 
 * @route PUT /api/v1/auth/change-password
 * @access Private (requires authentication)
 * 
 * @param {string} req.body.currentPassword - User's current password
 * @param {string} req.body.newPassword - New password (min 8 chars, must include uppercase, lowercase, number, special char)
 * @param {string} req.body.confirmPassword - New password confirmation (must match newPassword)
 * 
 * @returns {Object} Response confirming password change
 * @returns {string} response.message - Success message
 * 
 * @throws {ApiError} 401 - Not authenticated (handled by auth middleware)
 * @throws {ApiError} 401 - Current password is incorrect
 * @throws {ApiError} 400 - New password is same as current password
 * @throws {ApiError} 404 - User not found
 * @throws {ApiError} 429 - Too many password change attempts (rate limit)
 * 
 * @example
 * PUT /api/v1/auth/change-password
 * Headers: { Authorization: "Bearer <token>" }
 * {
 *   "currentPassword": "OldPass123!",
 *   "newPassword": "NewSecurePass456!",
 *   "confirmPassword": "NewSecurePass456!"
 * }
 */
export const changePassword = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { currentPassword, newPassword } = req.body;

        // Get user with password field
        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            throw ApiError.notFound(AUTH_MESSAGES.USER_NOT_FOUND);
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            // Log failed password change attempt
            logSecurityEvent('password_change_failed_invalid_current', req, {
                userId: user._id,
                reason: 'invalid_current_password',
            });
            throw ApiError.unauthorized(AUTH_MESSAGES.INVALID_CURRENT_PASSWORD);
        }

        // Check if new password is same as current password
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            logSecurityEvent('password_change_failed_reuse', req, {
                userId: user._id,
                reason: 'password_reuse',
            });
            throw ApiError.badRequest(AUTH_MESSAGES.PASSWORD_REUSE);
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, HASHING.SALT_ROUNDS);

        // Update password
        await User.findByIdAndUpdate(user._id, { password: hashedPassword });

        // Log successful password change
        logSecurityEvent('password_changed', req, {
            userId: user._id,
            email: user.email,
        });

        return responseService.response({
            res,
            data: {},
            message: AUTH_MESSAGES.PASSWORD_CHANGED,
            statusCode: 200
        });
    }
);

