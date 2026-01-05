import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';
import { validate } from '../middleware/validate';
import {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    resetUserPassword
} from '../controllers/user.controller';
import {
    createUserSchema,
    updateUserSchema,
    resetPasswordSchema
} from '../schema/user.validation';

const router = Router();

router.get('/', authenticate, authorize('admin'), getAllUsers);
router.get('/:id', authenticate, authorize('admin'), getUser);
router.post('/', authenticate, authorize('admin'), validate(createUserSchema), createUser);
router.put('/:id', authenticate, authorize('admin'), validate(updateUserSchema), updateUser);
router.delete('/:id', authenticate, authorize('admin'), deleteUser);
router.put('/:id/reset-password', authenticate, authorize('admin'), validate(resetPasswordSchema), resetUserPassword);

export default router;
