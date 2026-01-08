import { Router } from 'express';
import {
    createPaymentMethod,
    getUserPaymentMethods,
    getPaymentMethodById,
    updatePaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    getDefaultPaymentMethod
} from '../controllers/payment-method.controller';
import { authenticate } from '../auth/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all payment methods for current user
router.get('/', getUserPaymentMethods);

// Get default payment method
router.get('/default', getDefaultPaymentMethod);

// Get specific payment method
router.get('/:id', getPaymentMethodById);

// Create new payment method
router.post('/', createPaymentMethod);

// Update payment method
router.put('/:id', updatePaymentMethod);

// Set payment method as default
router.patch('/:id/set-default', setDefaultPaymentMethod);

// Delete payment method (soft delete)
router.delete('/:id', deletePaymentMethod);

export default router;
