import { Router } from 'express';
import {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createUserSchema, loginSchema, changePasswordSchema } from '../schema/user.validation';
import { authLimiter, strictLimiter } from '../middleware/rate-limiter.middleware';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authLimiter, validate(createUserSchema), register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authLimiter, validate(loginSchema), login);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, getProfile);

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticate, updateProfile);

/**
 * @route   PUT /api/v1/auth/change-password
 * @desc    Change user password (requires current password)
 * @access  Private
 * @security Requires valid JWT token and current password verification
 * @rateLimit 3 requests per hour (strict limiter)
 */
router.put('/change-password', authenticate, strictLimiter, validate(changePasswordSchema), changePassword);

export default router;

