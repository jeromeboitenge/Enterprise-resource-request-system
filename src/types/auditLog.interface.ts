export enum AuditAction {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    APPROVE = 'approve',
    REJECT = 'reject',
    LOGIN = 'login',
    LOGOUT = 'logout',
    PAYMENT = 'payment'
}

export interface AuditLogInterface {
    userId: string;
    userRole: string;
    action: AuditAction;
    resource: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
    timestamp: Date;
}
