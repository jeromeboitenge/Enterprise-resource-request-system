export enum PaymentMethod {
    Bank = 'bank',
    MobileMoney = 'mobile_money',
    Cash = 'cash'
}

export interface PaymentInterface {
    _id?: string;
    requestId: string;
    financeOfficerId: string;
    amountPaid: number;
    paymentMethod: PaymentMethod;
    paymentDate: Date;
}
