export enum RequestStatus {
    Draft = 'draft',
    Submitted = 'submitted',
    ManagerApproved = 'manager_approved',
    UnderReview = 'under_review',
    Approved = 'approved',
    Rejected = 'rejected',
    Funded = 'funded',
    Fulfilled = 'fulfilled',
    Cancelled = 'cancelled'
}

export enum Priority {
    Low = 'low',
    Medium = 'medium',
    High = 'high',
    Urgent = 'urgent'
}

export interface ResourceRequestInterface {
    userId: string;
    departmentId: string;
    title: string;
    resourceName: string;
    resourceType: string;
    description?: string;
    quantity: number;
    estimatedCost: number;
    priority: Priority;
    status: RequestStatus;
    createdAt: Date;
    updatedAt?: Date;
}

