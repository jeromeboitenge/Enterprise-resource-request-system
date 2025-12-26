export interface AuditLogInterface {
    _id?: string;
    userId: string;
    action: string;
    createdAt: Date;
}
