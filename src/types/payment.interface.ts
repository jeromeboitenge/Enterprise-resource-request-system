export enum PaymentMethod {
    Bank = 'bank',
    MobileMoney = 'mobile_money',
    Cash = 'cash'
}

export interface PaymentInterface {

    requestId: string;
    financeOfficerId: string;
    amountPaid: number;
    paymentMethod: PaymentMethod;
    paymentDate: Date;
}
