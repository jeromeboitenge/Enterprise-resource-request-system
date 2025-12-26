export enum RequestStatus {
    Pending = 'pending',
    Approved = 'approved',
    Rejected = 'rejected',
    Paid = 'paid'
}

export interface ResourceRequestInterface {
    _id?: string;
    userId: string;
    departmentId: string;
    resourceName: string;
    description?: string;
    amountRequested: number;
    status: RequestStatus;
    createdAt: Date;
}
