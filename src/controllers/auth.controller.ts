import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../model/user';

/**
 * ============================================
 * REGISTER NEW USER
 * ============================================
 * 
 * This function creates a new user account.
 * 
 * Steps:
 * 1. Get user data from request body
 * 2. Check if user already exists
 * 3. Hash the password for security
 * 4. Save user to database
 * 5. Create a JWT token for authentication
 * 6. Send response with user data and token
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Step 1: Get data from request body
        const { name, email, password, role, department } = req.body;

        // Step 2: Check if user with this email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Step 3: Hash the password (12 rounds makes it very secure)
        const hashedPassword = await bcrypt.hash(password, 12);

        // Step 4: Create new user in database
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'employee', // Default to employee if no role provided
            department
        });

        // Step 5: Create JWT token (expires in 1 day)
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '1d' }
        );

        // Step 6: Prepare user data for response (remove password)
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            isActive: user.isActive,
            createdAt: user.createdAt
        };

        // Step 7: Send success response
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: userResponse,
                token
            }
        });

    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};

/**
 * ============================================
 * LOGIN USER
 * ============================================
 * 
 * This function authenticates a user and provides a token.
 * 
 * Steps:
 * 1. Get email and password from request
 * 2. Find user in database
 * 3. Check if account is locked
 * 4. Verify password
 * 5. Check if account is active
 * 6. Create JWT token
 * 7. Send response with user data and token
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Step 1: Get login credentials from request body
        const { email, password } = req.body;

        // Step 2: Find user by email (include password field for verification)
        const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Step 3: Check if account is locked due to too many failed attempts
        if (user.isLocked) {
            // Calculate how many minutes until unlock
            const lockTimeRemaining = user.lockUntil
                ? Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000)
                : 0;

            return res.status(401).json({
                success: false,
                message: `Account is locked. Please try again in ${lockTimeRemaining} minutes.`
            });
        }

        // Step 4: Verify password using bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            // Increment failed login attempts
            await user.incLoginAttempts();

            // Calculate remaining attempts before lockout (max 5 attempts)
            const remainingAttempts = 5 - (user.loginAttempts || 0) - 1;

            if (remainingAttempts > 0) {
                return res.status(401).json({
                    success: false,
                    message: `Invalid email or password. ${remainingAttempts} attempts remaining.`
                });
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'Account locked due to too many failed login attempts.'
                });
            }
        }

        // Step 5: Check if user account is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Please contact administrator.'
            });
        }

        // Step 6: Reset login attempts on successful login
        if (user.loginAttempts && user.loginAttempts > 0) {
            await user.resetLoginAttempts();
        }

        // Update last login timestamp
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

        // Step 7: Create JWT token (expires in 1 day)
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '1d' }
        );

        // Prepare user data for response (remove password)
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            isActive: user.isActive
        };

        // Step 8: Send success response
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: userResponse,
                token
            }
        });

    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};

/**
 * ============================================
 * GET USER PROFILE
 * ============================================
 * 
 * This function gets the current logged-in user's profile.
 * User must be authenticated (have valid token).
 * 
 * Steps:
 * 1. Get user ID from req.user (set by auth middleware)
 * 2. Find user in database
 * 3. Send user data in response
 */
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Step 1: Get user from database using ID from auth middleware
        const user = await User.findById(req.user._id).select('-password');

        // Step 2: Check if user exists
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Step 3: Send user data
        res.status(200).json({
            success: true,
            message: 'Profile retrieved successfully',
            data: { user }
        });

    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};

/**
 * ============================================
 * UPDATE USER PROFILE
 * ============================================
 * 
 * This function updates the current user's profile (name and email).
 * User must be authenticated.
 * 
 * Steps:
 * 1. Get updated data from request body
 * 2. Check if new email is already taken
 * 3. Update user in database
 * 4. Send updated user data
 */
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Step 1: Get updated data from request body
        const { name, email } = req.body;

        // Step 2: If email is being changed, check if it's already taken
        if (email && email !== req.user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Email is already in use'
                });
            }
        }

        // Step 3: Update user in database
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, email },
            { new: true, runValidators: true } // Return updated user and run validation
        ).select('-password');

        // Check if user was found
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Step 4: Send updated user data
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });

    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};

/**
 * ============================================
 * CHANGE PASSWORD
 * ============================================
 * 
 * This function allows users to change their password.
 * User must be authenticated and provide current password.
 * 
 * Steps:
 * 1. Get passwords from request body
 * 2. Find user and verify current password
 * 3. Check that new password is different
 * 4. Hash new password
 * 5. Update password in database
 * 6. Send success response
 */
export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Step 1: Get passwords from request body
        const { currentPassword, newPassword } = req.body;

        // Step 2: Get user with password field
        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Step 3: Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Step 4: Check if new password is same as current password
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: 'New password must be different from current password'
            });
        }

        // Step 5: Hash new password (12 rounds for security)
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Step 6: Update password in database
        await User.findByIdAndUpdate(user._id, { password: hashedPassword });

        // Step 7: Send success response
        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
            data: {}
        });

    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};
