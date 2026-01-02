import { PopulateOptions } from 'mongoose';

/**
 * Database Population Helpers
 * 
 * Centralized population patterns for consistent data loading across controllers.
 * Eliminates duplicate .populate() calls and ensures consistency.
 */

/**
 * Standard population patterns for common relationships
 */
export const POPULATE_PATTERNS = {
    /**
     * Full user details with department
     */
    user: {
        path: 'userId',
        select: 'name email role department isActive'
    } as PopulateOptions,

    /**
     * Basic user details (name and email only)
     */
    userBasic: {
        path: 'userId',
        select: 'name email'
    } as PopulateOptions,

    /**
     * User with role information
     */
    userWithRole: {
        path: 'userId',
        select: 'name email role'
    } as PopulateOptions,

    /**
     * Department details
     */
    department: {
        path: 'departmentId',
        select: 'name code description'
    } as PopulateOptions,

    /**
     * Department name only
     */
    departmentName: {
        path: 'departmentId',
        select: 'name'
    } as PopulateOptions,

    /**
     * Approver details
     */
    approver: {
        path: 'approverId',
        select: 'name email role'
    } as PopulateOptions,

    /**
     * Finance officer details
     */
    financeOfficer: {
        path: 'financeOfficerId',
        select: 'name email role'
    } as PopulateOptions,

    /**
     * Request reference
     */
    request: {
        path: 'requestId'
    } as PopulateOptions,

    /**
     * Request with nested user and department
     */
    requestFull: {
        path: 'requestId',
        populate: [
            { path: 'userId', select: 'name email department' },
            { path: 'departmentId', select: 'name' }
        ]
    } as PopulateOptions
};

/**
 * Populate request with user and department details
 * 
 * @param query - Mongoose query object
 * @param includeUserDepartment - Include user's department field
 * @returns Query with populated fields
 * 
 * @example
 * ```typescript
 * const request = await populateRequest(
 *   ResourceRequest.findById(id)
 * );
 * ```
 */
export const populateRequest = (query: any, includeUserDepartment: boolean = false) => {
    return query
        .populate(includeUserDepartment ? POPULATE_PATTERNS.user : POPULATE_PATTERNS.userWithRole)
        .populate(POPULATE_PATTERNS.departmentName);
};

/**
 * Populate approval with approver details
 * 
 * @param query - Mongoose query object
 * @returns Query with populated approver
 * 
 * @example
 * ```typescript
 * const approval = await populateApproval(
 *   Approval.findById(id)
 * );
 * ```
 */
export const populateApproval = (query: any) => {
    return query.populate(POPULATE_PATTERNS.approver);
};

/**
 * Populate payment with all related details
 * 
 * @param query - Mongoose query object
 * @returns Query with populated fields
 * 
 * @example
 * ```typescript
 * const payment = await populatePayment(
 *   Payment.findById(id)
 * );
 * ```
 */
export const populatePayment = (query: any) => {
    return query
        .populate(POPULATE_PATTERNS.requestFull)
        .populate(POPULATE_PATTERNS.financeOfficer);
};

/**
 * Apply multiple population patterns to a query
 * 
 * @param query - Mongoose query object
 * @param patterns - Array of pattern keys from POPULATE_PATTERNS
 * @returns Query with all patterns applied
 * 
 * @example
 * ```typescript
 * const result = await applyPopulations(
 *   Model.find(),
 *   ['user', 'department']
 * );
 * ```
 */
export const applyPopulations = (
    query: any,
    patterns: Array<keyof typeof POPULATE_PATTERNS>
) => {
    patterns.forEach(pattern => {
        query = query.populate(POPULATE_PATTERNS[pattern]);
    });
    return query;
};
