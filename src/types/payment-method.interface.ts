export enum PaymentMethodType {
    BANK = 'BANK',
    PAYPAL = 'PAYPAL',
    MOBILE_MONEY = 'MOBILE_MONEY'
}

export interface BankDetails {
    bankName: string;
    accountNumber: string;
    accountName: string;
}

export interface PayPalDetails {
    paypalEmail: string;
}

export interface MobileMoneyDetails {
    phoneNumber: string;
    provider: string;
}

export interface PaymentMethodData {
    type: PaymentMethodType;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    paypalEmail?: string;
    phoneNumber?: string;
    provider?: string;
    isDefault?: boolean;
}

export interface PaymentMethodResponse {
    id: string;
    userId: string;
    type: PaymentMethodType;
    bankName?: string;
    accountNumber?: string; // Masked
    accountName?: string;
    paypalEmail?: string; // Masked
    phoneNumber?: string; // Masked
    provider?: string;
    isDefault: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
