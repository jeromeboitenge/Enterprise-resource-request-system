export enum ApprovalDecision {
    Approved = 'approved',
    Rejected = 'rejected'
}

export interface ApprovalInterface {
    _id?: string;
    requestId: string;
    approverId: string;
    decision: ApprovalDecision;
    comment?: string;
    decisionDate: Date;
}
