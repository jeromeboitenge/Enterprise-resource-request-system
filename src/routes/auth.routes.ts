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

router.post('/register', authLimiter, validate(createUserSchema), register);

router.post('/login', authLimiter, validate(loginSchema), login);

router.get('/profile', authenticate, getProfile);

router.put('/profile', authenticate, updateProfile);

router.put('/change-password', authenticate, strictLimiter, validate(changePasswordSchema), changePassword);

export default router;

