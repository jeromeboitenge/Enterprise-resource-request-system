import { ApiError } from './ApiError';
import { RequestStatus } from '../types/request.interface';

/**
 * Validation Helpers
 * 
 * Reusable validation functions for common authorization and business logic checks.
 */

/**
 * Validate resource ownership
 * 
 * Checks if the current user owns the specified resource.
 * Throws forbidden error if ownership check fails.
 * 
 * @param resourceUserId - User ID from the resource
 * @param currentUserId - Current authenticated user's ID
 * @param resourceName - Name of the resource type (for error message)
 * @throws {ApiError} 403 Forbidden if user doesn't own the resource
 * 
 * @example
 * ```typescript
 * validateOwnership(
 *   request.userId.toString(),
 *   req.user._id.toString(),
 *   'request'
 * );
 * ```
 */
export const validateOwnership = (
    resourceUserId: string,
    currentUserId: string,
    resourceName: string = 'resource'
): void => {
    if (resourceUserId.toString() !== currentUserId.toString()) {
        throw ApiError.forbidden(
            `You can only modify your own ${resourceName}s`
        );
    }
};

/**
 * Validate request status for operations
 * 
 * Checks if a request is in an allowed status for the specified operation.
 * Throws bad request error if status is not allowed.
 * 
 * @param currentStatus - Current status of the request
 * @param allowedStatuses - Array of allowed statuses
 * @param action - Action being performed (for error message)
 * @throws {ApiError} 400 Bad Request if status is not allowed
 * 
 * @example
 * ```typescript
 * validateRequestStatus(
 *   request.status,
 *   [RequestStatus.Draft, RequestStatus.Submitted],
 *   'update'
 * );
 * ```
 */
export const validateRequestStatus = (
    currentStatus: RequestStatus,
    allowedStatuses: RequestStatus[],
    action: string
): void => {
    if (!allowedStatuses.includes(currentStatus)) {
        throw ApiError.badRequest(
            `Cannot ${action} request with status: ${currentStatus}. ` +
            `Allowed statuses: ${allowedStatuses.join(', ')}`
        );
    }
};

/**
 * Validate user has required role
 * 
 * Checks if user has one of the required roles.
 * Throws forbidden error if role check fails.
 * 
 * @param userRole - Current user's role
 * @param requiredRoles - Array of allowed roles
 * @param action - Action being performed (for error message)
 * @throws {ApiError} 403 Forbidden if user doesn't have required role
 * 
 * @example
 * ```typescript
 * validateRole(
 *   req.user.role,
 *   ['manager', 'admin'],
 *   'approve requests'
 * );
 * ```
 */
export const validateRole = (
    userRole: string,
    requiredRoles: string[],
    action: string = 'perform this action'
): void => {
    if (!requiredRoles.includes(userRole)) {
        throw ApiError.forbidden(
            `Insufficient permissions to ${action}. ` +
            `Required roles: ${requiredRoles.join(', ')}`
        );
    }
};

/**
 * Validate amount does not exceed limit
 * 
 * Checks if an amount is within the allowed limit.
 * Throws bad request error if amount exceeds limit.
 * 
 * @param amount - Amount to validate
 * @param limit - Maximum allowed amount
 * @param fieldName - Name of the field (for error message)
 * @throws {ApiError} 400 Bad Request if amount exceeds limit
 * 
 * @example
 * ```typescript
 * validateAmount(
 *   paymentAmount,
 *   request.estimatedCost,
 *   'payment amount'
 * );
 * ```
 */
export const validateAmount = (
    amount: number,
    limit: number,
    fieldName: string = 'amount'
): void => {
    if (amount > limit) {
        throw ApiError.badRequest(
            `${fieldName} (${amount}) cannot exceed the limit (${limit})`
        );
    }
};

/**
 * Validate resource exists
 * 
 * Checks if a resource was found in the database.
 * Throws not found error if resource is null/undefined.
 * 
 * @param resource - Resource to check
 * @param resourceName - Name of the resource type
 * @param resourceId - ID of the resource (optional, for better error message)
 * @throws {ApiError} 404 Not Found if resource doesn't exist
 * 
 * @example
 * ```typescript
 * const request = await ResourceRequest.findById(id);
 * validateResourceExists(request, 'Request', id);
 * // Use non-null assertion after validation
 * request!.userId
 * ```
 */
export const validateResourceExists = (
    resource: any,
    resourceName: string,
    resourceId?: string
): void => {
    if (!resource) {
        const message = resourceId
            ? `${resourceName} with ID ${resourceId} not found`
            : `${resourceName} not found`;
        throw ApiError.notFound(message);
    }
};

/**
 * Validate no duplicate exists
 * 
 * Checks if a duplicate resource already exists.
 * Throws conflict error if duplicate is found.
 * 
 * @param existingResource - Existing resource (if found)
 * @param resourceName - Name of the resource type
 * @param fieldName - Name of the conflicting field
 * @throws {ApiError} 409 Conflict if duplicate exists
 * 
 * @example
 * ```typescript
 * const existing = await Department.findOne({ name });
 * validateNoDuplicate(existing, 'Department', 'name');
 * ```
 */
export const validateNoDuplicate = (
    existingResource: any,
    resourceName: string,
    fieldName: string = 'identifier'
): void => {
    if (existingResource) {
        throw ApiError.conflict(
            `${resourceName} with this ${fieldName} already exists`
        );
    }
};
