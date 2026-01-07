import { Router } from 'express';
import {
    register,
    login,
    verifyLogin,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    getProfile,
    updateProfile,
    changePassword
} from './auth.controller';
import { authenticate } from './auth.middleware';
import { validate } from '../middleware/validate';
import { createUserSchema, loginSchema, changePasswordSchema, resetPasswordWithEmailSchema } from '../validator/user.validation';
import { authLimiter, strictLimiter } from '../middleware/rate-limiter.middleware';

const router = Router();

router.post('/register', authLimiter, validate(createUserSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/verify-login', authLimiter, verifyLogin);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordWithEmailSchema), resetPassword);
router.post('/verify-reset-otp', authLimiter, verifyResetOtp);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, strictLimiter, validate(changePasswordSchema), changePassword);

export default router;
