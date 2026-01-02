/**
 * User-Facing Messages Constants
 * 
 * This file centralizes all user-facing messages used throughout the application.
 * Centralizing messages makes it easier to:
 * - Maintain consistent messaging across the application
 * - Update messages in one place
 * - Prepare for internationalization (i18n) in the future
 * 
 * @module constants/messages
 */

/**
 * Authentication-related messages
 */
export const AUTH_MESSAGES = {
    // Success messages
    REGISTER_SUCCESS: 'User registered successfully',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    PROFILE_RETRIEVED: 'Profile retrieved successfully',
    PROFILE_UPDATED: 'Profile updated successfully',
    PASSWORD_CHANGED: 'Password changed successfully',

    // Error messages
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_EXISTS: 'User with this email already exists',
    USER_NOT_FOUND: 'User not found',
    ACCOUNT_DEACTIVATED: 'Your account has been deactivated. Please contact an administrator.',
    ACCOUNT_LOCKED: 'Account is temporarily locked due to multiple failed login attempts. Please try again in {minutes} minutes.',
    ACCOUNT_LOCKED_GENERIC: 'Account has been locked for 15 minutes due to multiple failed attempts.',
    INVALID_CURRENT_PASSWORD: 'Current password is incorrect',
    PASSWORD_REUSE: 'New password cannot be the same as the current password',

    // Token errors
    NO_TOKEN: 'No token provided',
    INVALID_TOKEN: 'Invalid token',
    TOKEN_EXPIRED: 'Token expired',

    // Validation errors
    EMAIL_REQUIRED: 'Email is required',
    EMAIL_INVALID: 'Please provide a valid email address',
    PASSWORD_REQUIRED: 'Password is required',
    NAME_REQUIRED: 'Name is required',
    PASSWORDS_NOT_MATCH: 'Passwords do not match',
    PASSWORD_CONFIRMATION_REQUIRED: 'Password confirmation is required',

    // Login attempts
    REMAINING_ATTEMPTS: 'Invalid email or password. {attempts} attempts remaining before account lockout.',
} as const;

/**
 * Authorization-related messages
 */
export const AUTHORIZATION_MESSAGES = {
    AUTHENTICATION_REQUIRED: 'Authentication required',
    ACCESS_DENIED: 'Access denied. Required roles: {roles}',
    INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action',
} as const;

/**
 * Request-related messages
 */
export const REQUEST_MESSAGES = {
    // Success messages
    REQUEST_CREATED: 'Resource request created successfully',
    REQUEST_UPDATED: 'Resource request updated successfully',
    REQUEST_DELETED: 'Resource request deleted successfully',
    REQUEST_RETRIEVED: 'Resource request retrieved successfully',
    REQUESTS_RETRIEVED: 'Resource requests retrieved successfully',
    REQUEST_SUBMITTED: 'Request submitted for approval',
    REQUEST_CANCELLED: 'Request cancelled successfully',

    // Error messages
    REQUEST_NOT_FOUND: 'Resource request not found',
    CANNOT_MODIFY_REQUEST: 'Cannot modify request in current status',
    CANNOT_DELETE_REQUEST: 'Cannot delete request in current status',
    INVALID_STATUS_TRANSITION: 'Invalid status transition',
    UNAUTHORIZED_REQUEST_ACCESS: 'You are not authorized to access this request',
} as const;

/**
 * Approval-related messages
 */
export const APPROVAL_MESSAGES = {
    // Success messages
    APPROVAL_CREATED: 'Approval record created successfully',
    REQUEST_APPROVED: 'Request approved successfully',
    REQUEST_REJECTED: 'Request rejected successfully',
    APPROVALS_RETRIEVED: 'Approvals retrieved successfully',

    // Error messages
    APPROVAL_NOT_FOUND: 'Approval record not found',
    ALREADY_APPROVED: 'This request has already been approved',
    ALREADY_REJECTED: 'This request has already been rejected',
    CANNOT_APPROVE_OWN_REQUEST: 'You cannot approve your own request',
    INVALID_APPROVER: 'You are not authorized to approve this request',
    COMMENT_REQUIRED_FOR_REJECTION: 'Comment is required when rejecting a request',
} as const;

/**
 * Payment-related messages
 */
export const PAYMENT_MESSAGES = {
    // Success messages
    PAYMENT_CREATED: 'Payment record created successfully',
    PAYMENT_UPDATED: 'Payment updated successfully',
    PAYMENT_PROCESSED: 'Payment processed successfully',
    PAYMENTS_RETRIEVED: 'Payments retrieved successfully',

    // Error messages
    PAYMENT_NOT_FOUND: 'Payment record not found',
    REQUEST_NOT_APPROVED: 'Request must be approved before processing payment',
    PAYMENT_ALREADY_PROCESSED: 'Payment has already been processed',
    INVALID_PAYMENT_AMOUNT: 'Payment amount must be greater than zero',
    UNAUTHORIZED_PAYMENT_ACCESS: 'Only finance personnel can process payments',
} as const;

/**
 * Department-related messages
 */
export const DEPARTMENT_MESSAGES = {
    // Success messages
    DEPARTMENT_CREATED: 'Department created successfully',
    DEPARTMENT_UPDATED: 'Department updated successfully',
    DEPARTMENT_DELETED: 'Department deleted successfully',
    DEPARTMENT_RETRIEVED: 'Department retrieved successfully',
    DEPARTMENTS_RETRIEVED: 'Departments retrieved successfully',

    // Error messages
    DEPARTMENT_NOT_FOUND: 'Department not found',
    DEPARTMENT_EXISTS: 'Department with this name already exists',
    DEPARTMENT_HAS_USERS: 'Cannot delete department with active users',
} as const;

/**
 * Notification-related messages
 */
export const NOTIFICATION_MESSAGES = {
    // Success messages
    NOTIFICATION_SENT: 'Notification sent successfully',
    NOTIFICATION_MARKED_READ: 'Notification marked as read',
    NOTIFICATIONS_RETRIEVED: 'Notifications retrieved successfully',
    ALL_NOTIFICATIONS_READ: 'All notifications marked as read',

    // Error messages
    NOTIFICATION_NOT_FOUND: 'Notification not found',
} as const;

/**
 * Validation-related messages
 */
export const VALIDATION_MESSAGES = {
    // General validation
    REQUIRED_FIELD: '{field} is required',
    INVALID_FORMAT: 'Invalid {field} format',
    TOO_SHORT: '{field} must be at least {min} characters long',
    TOO_LONG: '{field} cannot exceed {max} characters',
    INVALID_VALUE: 'Invalid value for {field}',
    INVALID_ENUM: '{field} must be one of: {values}',

    // Specific validations
    INVALID_EMAIL: 'Please provide a valid email address',
    INVALID_DATE: 'Please provide a valid date',
    INVALID_AMOUNT: 'Amount must be a positive number',
    INVALID_ID: 'Invalid {field}: {value}',

    // Password validation
    PASSWORD_MIN_LENGTH: 'Password must be at least {min} characters long',
    PASSWORD_PATTERN: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character ({chars})',
} as const;

/**
 * General system messages
 */
export const SYSTEM_MESSAGES = {
    // Success
    OPERATION_SUCCESSFUL: 'Operation completed successfully',

    // Errors
    INTERNAL_ERROR: 'Internal server error',
    NOT_FOUND: 'Route {route} not found',
    VALIDATION_FAILED: 'Validation failed',
    DATABASE_ERROR: 'Database operation failed',

    // Rate limiting
    TOO_MANY_REQUESTS: 'Too many requests, please try again later',
    TOO_MANY_AUTH_ATTEMPTS: 'Too many authentication attempts, please try again after 15 minutes',
    TOO_MANY_SENSITIVE_REQUESTS: 'Too many requests for this operation, please try again later',
} as const;

/**
 * Helper function to replace placeholders in messages
 * 
 * @example
 * ```typescript
 * formatMessage(AUTH_MESSAGES.REMAINING_ATTEMPTS, { attempts: 3 })
 * // Returns: "Invalid email or password. 3 attempts remaining before account lockout."
 * ```
 * 
 * @param message - Message template with placeholders in {key} format
 * @param params - Object with key-value pairs to replace in the message
 * @returns Formatted message with placeholders replaced
 */
export const formatMessage = (message: string, params: Record<string, any>): string => {
    let formattedMessage = message;

    for (const [key, value] of Object.entries(params)) {
        formattedMessage = formattedMessage.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    }

    return formattedMessage;
};
