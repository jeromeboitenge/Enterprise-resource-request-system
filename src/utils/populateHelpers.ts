import { PopulateOptions } from 'mongoose';

export const POPULATE_PATTERNS = {

    user: {
        path: 'userId',
        select: 'name email role department isActive'
    } as PopulateOptions,

    userBasic: {
        path: 'userId',
        select: 'name email'
    } as PopulateOptions,

    userWithRole: {
        path: 'userId',
        select: 'name email role'
    } as PopulateOptions,

    department: {
        path: 'departmentId',
        select: 'name code description'
    } as PopulateOptions,

    departmentName: {
        path: 'departmentId',
        select: 'name'
    } as PopulateOptions,

    approver: {
        path: 'approverId',
        select: 'name email role'
    } as PopulateOptions,

    financeOfficer: {
        path: 'financeOfficerId',
        select: 'name email role'
    } as PopulateOptions,

    request: {
        path: 'requestId'
    } as PopulateOptions,

    requestFull: {
        path: 'requestId',
        populate: [
            { path: 'userId', select: 'name email department' },
            { path: 'departmentId', select: 'name' }
        ]
    } as PopulateOptions
};

export const populateRequest = (query: any, includeUserDepartment: boolean = false) => {
    return query
        .populate(includeUserDepartment ? POPULATE_PATTERNS.user : POPULATE_PATTERNS.userWithRole)
        .populate(POPULATE_PATTERNS.departmentName);
};

export const populateApproval = (query: any) => {
    return query.populate(POPULATE_PATTERNS.approver);
};

export const populatePayment = (query: any) => {
    return query
        .populate(POPULATE_PATTERNS.requestFull)
        .populate(POPULATE_PATTERNS.financeOfficer);
};

export const applyPopulations = (
    query: any,
    patterns: Array<keyof typeof POPULATE_PATTERNS>
) => {
    patterns.forEach(pattern => {
        query = query.populate(POPULATE_PATTERNS[pattern]);
    });
    return query;
};
