import { Router } from 'express';
import {
    processPayment,
    getPaymentHistory,
    getPayment,
    getPendingPayments
} from '../controllers/payment.controller';
import { authenticate } from '../auth/auth.middleware';
import { authorize } from '../auth/authorize.middleware';
import { validate } from '../middleware/validate';
import { processPaymentSchema } from '../schema/payment.validation';
import { Roles } from '../types/user.interface';

const router = Router();

router.use(authenticate);
router.use(authorize(Roles.Finance, Roles.Admin));


router.get('/pending', getPendingPayments);


router.post(
    '/:requestId',
    validate(processPaymentSchema),
    processPayment
);


router.get('/', getPaymentHistory);


router.get('/:id', getPayment);

export default router;
