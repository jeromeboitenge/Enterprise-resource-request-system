import prisma from '../lib/prisma';
import { PaymentMethodType, PaymentMethodData } from '../types/payment-method.interface';

export class PaymentMethodService {

    static validatePaymentMethodData(type: PaymentMethodType, data: PaymentMethodData): {
        valid: boolean;
        message?: string;
    } {
        switch (type) {
            case PaymentMethodType.BANK:
                if (!data.bankName || !data.accountNumber || !data.accountName) {
                    return {
                        valid: false,
                        message: 'Bank name, account number, and account name are required for bank payment method'
                    };
                }
                break;

            case PaymentMethodType.PAYPAL:
                if (!data.paypalEmail) {
                    return {
                        valid: false,
                        message: 'PayPal email is required for PayPal payment method'
                    };
                }
                // Basic email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(data.paypalEmail)) {
                    return {
                        valid: false,
                        message: 'Invalid PayPal email format'
                    };
                }
                break;

            case PaymentMethodType.MOBILE_MONEY:
                if (!data.phoneNumber || !data.provider) {
                    return {
                        valid: false,
                        message: 'Phone number and provider are required for mobile money payment method'
                    };
                }
                break;

            default:
                return {
                    valid: false,
                    message: 'Invalid payment method type'
                };
        }

        return { valid: true };
    }

    static maskSensitiveData(paymentMethod: any) {
        const masked = { ...paymentMethod };

        if (masked.accountNumber) {
            const last4 = masked.accountNumber.slice(-4);
            masked.accountNumber = `****${last4}`;
        }

        if (masked.paypalEmail) {
            const [username, domain] = masked.paypalEmail.split('@');
            const maskedUsername = username.slice(0, 2) + '***';
            masked.paypalEmail = `${maskedUsername}@${domain}`;
        }

        if (masked.phoneNumber) {
            const last4 = masked.phoneNumber.slice(-4);
            masked.phoneNumber = `****${last4}`;
        }

        return masked;
    }

    static async createPaymentMethod(userId: string, data: PaymentMethodData) {
        // Validate data
        const validation = this.validatePaymentMethodData(data.type, data);
        if (!validation.valid) {
            throw new Error(validation.message);
        }

        // If setting as default, unset other defaults
        if (data.isDefault) {
            await prisma.paymentMethod.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false }
            });
        }

        // Create payment method
        const paymentMethod = await prisma.paymentMethod.create({
            data: {
                userId,
                type: data.type,
                bankName: data.bankName,
                accountNumber: data.accountNumber,
                accountName: data.accountName,
                paypalEmail: data.paypalEmail,
                phoneNumber: data.phoneNumber,
                provider: data.provider,
                isDefault: data.isDefault || false
            }
        });

        return this.maskSensitiveData(paymentMethod);
    }

    static async getUserPaymentMethods(userId: string, includeInactive = false) {
        const where: any = { userId };
        if (!includeInactive) {
            where.isActive = true;
        }

        const paymentMethods = await prisma.paymentMethod.findMany({
            where,
            orderBy: [
                { isDefault: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        return paymentMethods.map(pm => this.maskSensitiveData(pm));
    }

    static async getPaymentMethodById(id: string, userId: string) {
        const paymentMethod = await prisma.paymentMethod.findFirst({
            where: { id, userId }
        });

        if (!paymentMethod) {
            return null;
        }

        return this.maskSensitiveData(paymentMethod);
    }

    static async updatePaymentMethod(id: string, userId: string, data: Partial<PaymentMethodData>) {
        // Check ownership
        const existing = await prisma.paymentMethod.findFirst({
            where: { id, userId }
        });

        if (!existing) {
            throw new Error('Payment method not found');
        }

        // Validate if type is being changed
        if (data.type && data.type !== existing.type) {
            const validation = this.validatePaymentMethodData(data.type, data as PaymentMethodData);
            if (!validation.valid) {
                throw new Error(validation.message);
            }
        }

        // If setting as default, unset other defaults
        if (data.isDefault) {
            await prisma.paymentMethod.updateMany({
                where: { userId, isDefault: true, id: { not: id } },
                data: { isDefault: false }
            });
        }

        const updated = await prisma.paymentMethod.update({
            where: { id },
            data: {
                type: data.type,
                bankName: data.bankName,
                accountNumber: data.accountNumber,
                accountName: data.accountName,
                paypalEmail: data.paypalEmail,
                phoneNumber: data.phoneNumber,
                provider: data.provider,
                isDefault: data.isDefault
            }
        });

        return this.maskSensitiveData(updated);
    }

    static async deletePaymentMethod(id: string, userId: string) {
        // Check ownership
        const existing = await prisma.paymentMethod.findFirst({
            where: { id, userId }
        });

        if (!existing) {
            throw new Error('Payment method not found');
        }

        // Soft delete
        const deleted = await prisma.paymentMethod.update({
            where: { id },
            data: { isActive: false, isDefault: false }
        });

        return this.maskSensitiveData(deleted);
    }

    static async setDefaultPaymentMethod(id: string, userId: string) {
        // Check ownership
        const existing = await prisma.paymentMethod.findFirst({
            where: { id, userId, isActive: true }
        });

        if (!existing) {
            throw new Error('Payment method not found');
        }

        // Unset other defaults
        await prisma.paymentMethod.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false }
        });

        // Set as default
        const updated = await prisma.paymentMethod.update({
            where: { id },
            data: { isDefault: true }
        });

        return this.maskSensitiveData(updated);
    }

    static async getDefaultPaymentMethod(userId: string) {
        const paymentMethod = await prisma.paymentMethod.findFirst({
            where: { userId, isDefault: true, isActive: true }
        });

        if (!paymentMethod) {
            return null;
        }

        return this.maskSensitiveData(paymentMethod);
    }
}
