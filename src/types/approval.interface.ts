export enum ApprovalDecision {
    Approved = 'approved',
    Rejected = 'rejected'
}

export interface ApprovalInterface {

    requestId: string;
    approverId: string;
    decision: ApprovalDecision;
    comment?: string;
    decisionDate: Date;
}
