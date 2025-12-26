import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../model/user';
import { config } from '../config';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Register a new user
 * @route POST /api/v1/auth/register
 * @access Public
 */
export const register = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { name, email, password, role, department } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw ApiError.conflict('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            department
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            config.jwtSecret,
            { expiresIn: '1d' }
        );

        // Remove password from response
        const userResponse: any = user.toObject();
        delete userResponse.password;

        ApiResponse.created('User registered successfully', {
            user: userResponse,
            token
        }).send(res);
    }
);

/**
 * Login user
 * @route POST /api/v1/auth/login
 * @access Public
 */
export const login = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            throw ApiError.unauthorized('Invalid email or password');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw ApiError.unauthorized('Invalid email or password');
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            config.jwtSecret,
            { expiresIn: '1d' }
        );

        // Remove password from response
        const userResponse: any = user.toObject();
        delete userResponse.password;

        ApiResponse.success('Login successful', {
            user: userResponse,
            token
        }).send(res);
    }
);

/**
 * Get current user profile
 * @route GET /api/v1/auth/profile
 * @access Private
 */
export const getProfile = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const user = await User.findById(req.user._id).select('-password');

        if (!user) {
            throw ApiError.notFound('User not found');
        }

        ApiResponse.success('Profile retrieved successfully', { user }).send(res);
    }
);

/**
 * Update user profile
 * @route PUT /api/v1/auth/profile
 * @access Private
 */
export const updateProfile = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { name, email } = req.body;

        // Check if email is being changed and if it's already taken
        if (email && email !== req.user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw ApiError.conflict('Email already in use');
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, email },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            throw ApiError.notFound('User not found');
        }

        ApiResponse.success('Profile updated successfully', { user }).send(res);
    }
);
