// Updated to match Prisma schema enums
export enum RequestStatus {
    DRAFT = 'DRAFT',
    SUBMITTED = 'SUBMITTED',
    SEMI_APPROVED = 'SEMI_APPROVED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    PAID = 'PAID'
}

export enum Priority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH'
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

