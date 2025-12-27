import { Router } from 'express';
import {
    register,
    login,
    getProfile,
    updateProfile
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createUserSchema, loginSchema } from '../schema/user.validation';

const router = Router();

/**
 * @route   POST ¬
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validate(createUserSchema), register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validate(loginSchema), login);

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

export default router;
