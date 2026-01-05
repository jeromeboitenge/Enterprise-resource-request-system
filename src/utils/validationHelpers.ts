import { ApiError } from './ApiError';
import { RequestStatus } from '../types/request.interface';

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
