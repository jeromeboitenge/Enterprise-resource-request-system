export enum ApprovalDecision {
    Pending = 'pending',
    Approved = 'approved',
    Rejected = 'rejected'
}

export enum ApprovalLevel {
    Manager = 1,
    DepartmentHead = 2,
    Finance = 3,
    Admin = 4
}

export interface ApprovalInterface {
    requestId: string;
    approverId: string;
    approverRole: string;
    level: ApprovalLevel;
    decision: ApprovalDecision;
    comment?: string;
    decisionDate: Date;
}

