import { Request, Response, NextFunction } from 'express';
import { PaymentMethodService } from '../services/payment-method.service';
import { ResponseService } from '../utils/ResponseService';

const responseService = new ResponseService();

export const createPaymentMethod = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type, bankName, accountNumber, accountName, paypalEmail, phoneNumber, provider, isDefault } = req.body;

        const paymentMethod = await PaymentMethodService.createPaymentMethod(req.user.id, {
            type,
            bankName,
            accountNumber,
            accountName,
            paypalEmail,
            phoneNumber,
            provider,
            isDefault
        });

        return responseService.response({
            res,
            statusCode: 201,
            success: true,
            message: 'Payment method added successfully',
            data: { paymentMethod }
        });
    } catch (error: any) {
        if (error.message) {
            return responseService.response({
                res,
                statusCode: 400,
                success: false,
                message: error.message
            });
        }
        return next(error);
    }
};

export const getUserPaymentMethods = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const paymentMethods = await PaymentMethodService.getUserPaymentMethods(req.user.id);

        return responseService.response({
            res,
            statusCode: 200,
            success: true,
            message: 'Payment methods retrieved successfully',
            data: { paymentMethods }
        });
    } catch (error) {
        return next(error);
    }
};

export const getPaymentMethodById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const paymentMethod = await PaymentMethodService.getPaymentMethodById(id, req.user.id);

        if (!paymentMethod) {
            return responseService.response({
                res,
                statusCode: 404,
                success: false,
                message: 'Payment method not found'
            });
        }

        return responseService.response({
            res,
            statusCode: 200,
            success: true,
            message: 'Payment method retrieved successfully',
            data: { paymentMethod }
        });
    } catch (error) {
        return next(error);
    }
};

export const updatePaymentMethod = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { type, bankName, accountNumber, accountName, paypalEmail, phoneNumber, provider, isDefault } = req.body;

        const paymentMethod = await PaymentMethodService.updatePaymentMethod(id, req.user.id, {
            type,
            bankName,
            accountNumber,
            accountName,
            paypalEmail,
            phoneNumber,
            provider,
            isDefault
        });

        return responseService.response({
            res,
            statusCode: 200,
            success: true,
            message: 'Payment method updated successfully',
            data: { paymentMethod }
        });
    } catch (error: any) {
        if (error.message === 'Payment method not found') {
            return responseService.response({
                res,
                statusCode: 404,
                success: false,
                message: error.message
            });
        }
        if (error.message) {
            return responseService.response({
                res,
                statusCode: 400,
                success: false,
                message: error.message
            });
        }
        return next(error);
    }
};

export const deletePaymentMethod = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const paymentMethod = await PaymentMethodService.deletePaymentMethod(id, req.user.id);

        return responseService.response({
            res,
            statusCode: 200,
            success: true,
            message: 'Payment method deleted successfully',
            data: { paymentMethod }
        });
    } catch (error: any) {
        if (error.message === 'Payment method not found') {
            return responseService.response({
                res,
                statusCode: 404,
                success: false,
                message: error.message
            });
        }
        return next(error);
    }
};

export const setDefaultPaymentMethod = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const paymentMethod = await PaymentMethodService.setDefaultPaymentMethod(id, req.user.id);

        return responseService.response({
            res,
            statusCode: 200,
            success: true,
            message: 'Default payment method set successfully',
            data: { paymentMethod }
        });
    } catch (error: any) {
        if (error.message === 'Payment method not found') {
            return responseService.response({
                res,
                statusCode: 404,
                success: false,
                message: error.message
            });
        }
        return next(error);
    }
};

export const getDefaultPaymentMethod = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const paymentMethod = await PaymentMethodService.getDefaultPaymentMethod(req.user.id);

        if (!paymentMethod) {
            return responseService.response({
                res,
                statusCode: 404,
                success: false,
                message: 'No default payment method found'
            });
        }

        return responseService.response({
            res,
            statusCode: 200,
            success: true,
            message: 'Default payment method retrieved successfully',
            data: { paymentMethod }
        });
    } catch (error) {
        return next(error);
    }
};
