

export const AUTH_MESSAGES = {

    REGISTER_SUCCESS: 'User registered successfully',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    PROFILE_RETRIEVED: 'Profile retrieved successfully',
    PROFILE_UPDATED: 'Profile updated successfully',
    PASSWORD_CHANGED: 'Password changed successfully',

    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_EXISTS: 'User with this email already exists',
    USER_NOT_FOUND: 'User not found',
    ACCOUNT_DEACTIVATED: 'Your account has been deactivated. Please contact an administrator.',
    ACCOUNT_LOCKED: 'Account is temporarily locked due to multiple failed login attempts. Please try again in {minutes} minutes.',
    ACCOUNT_LOCKED_GENERIC: 'Account has been locked for 15 minutes due to multiple failed attempts.',
    INVALID_CURRENT_PASSWORD: 'Current password is incorrect',
    PASSWORD_REUSE: 'New password cannot be the same as the current password',

    NO_TOKEN: 'No token provided',
    INVALID_TOKEN: 'Invalid token',
    TOKEN_EXPIRED: 'Token expired',

    EMAIL_REQUIRED: 'Email is required',
    EMAIL_INVALID: 'Please provide a valid email address',
    PASSWORD_REQUIRED: 'Password is required',
    NAME_REQUIRED: 'Name is required',
    PASSWORDS_NOT_MATCH: 'Passwords do not match',
    PASSWORD_CONFIRMATION_REQUIRED: 'Password confirmation is required',

    REMAINING_ATTEMPTS: 'Invalid email or password. {attempts} attempts remaining before account lockout.',
} as const;

export const AUTHORIZATION_MESSAGES = {
    AUTHENTICATION_REQUIRED: 'Authentication required',
    ACCESS_DENIED: 'Access denied. Required roles: {roles}',
    INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action',
} as const;

export const REQUEST_MESSAGES = {

    REQUEST_CREATED: 'Resource request created successfully',
    REQUEST_UPDATED: 'Resource request updated successfully',
    REQUEST_DELETED: 'Resource request deleted successfully',
    REQUEST_RETRIEVED: 'Resource request retrieved successfully',
    REQUESTS_RETRIEVED: 'Resource requests retrieved successfully',
    REQUEST_SUBMITTED: 'Request submitted for approval',
    REQUEST_CANCELLED: 'Request cancelled successfully',

    REQUEST_NOT_FOUND: 'Resource request not found',
    CANNOT_MODIFY_REQUEST: 'Cannot modify request in current status',
    CANNOT_DELETE_REQUEST: 'Cannot delete request in current status',
    INVALID_STATUS_TRANSITION: 'Invalid status transition',
    UNAUTHORIZED_REQUEST_ACCESS: 'You are not authorized to access this request',
} as const;

export const APPROVAL_MESSAGES = {

    APPROVAL_CREATED: 'Approval record created successfully',
    REQUEST_APPROVED: 'Request approved successfully',
    REQUEST_REJECTED: 'Request rejected successfully',
    APPROVALS_RETRIEVED: 'Approvals retrieved successfully',

    APPROVAL_NOT_FOUND: 'Approval record not found',
    ALREADY_APPROVED: 'This request has already been approved',
    ALREADY_REJECTED: 'This request has already been rejected',
    CANNOT_APPROVE_OWN_REQUEST: 'You cannot approve your own request',
    INVALID_APPROVER: 'You are not authorized to approve this request',
    COMMENT_REQUIRED_FOR_REJECTION: 'Comment is required when rejecting a request',
} as const;

export const PAYMENT_MESSAGES = {

    PAYMENT_CREATED: 'Payment record created successfully',
    PAYMENT_UPDATED: 'Payment updated successfully',
    PAYMENT_PROCESSED: 'Payment processed successfully',
    PAYMENTS_RETRIEVED: 'Payments retrieved successfully',

    PAYMENT_NOT_FOUND: 'Payment record not found',
    REQUEST_NOT_APPROVED: 'Request must be approved before processing payment',
    PAYMENT_ALREADY_PROCESSED: 'Payment has already been processed',
    INVALID_PAYMENT_AMOUNT: 'Payment amount must be greater than zero',
    UNAUTHORIZED_PAYMENT_ACCESS: 'Only finance personnel can process payments',
} as const;

export const DEPARTMENT_MESSAGES = {

    DEPARTMENT_CREATED: 'Department created successfully',
    DEPARTMENT_UPDATED: 'Department updated successfully',
    DEPARTMENT_DELETED: 'Department deleted successfully',
    DEPARTMENT_RETRIEVED: 'Department retrieved successfully',
    DEPARTMENTS_RETRIEVED: 'Departments retrieved successfully',

    DEPARTMENT_NOT_FOUND: 'Department not found',
    DEPARTMENT_EXISTS: 'Department with this name already exists',
    DEPARTMENT_HAS_USERS: 'Cannot delete department with active users',
} as const;

export const NOTIFICATION_MESSAGES = {

    NOTIFICATION_SENT: 'Notification sent successfully',
    NOTIFICATION_MARKED_READ: 'Notification marked as read',
    NOTIFICATIONS_RETRIEVED: 'Notifications retrieved successfully',
    ALL_NOTIFICATIONS_READ: 'All notifications marked as read',

    NOTIFICATION_NOT_FOUND: 'Notification not found',
} as const;

export const VALIDATION_MESSAGES = {

    REQUIRED_FIELD: '{field} is required',
    INVALID_FORMAT: 'Invalid {field} format',
    TOO_SHORT: '{field} must be at least {min} characters long',
    TOO_LONG: '{field} cannot exceed {max} characters',
    INVALID_VALUE: 'Invalid value for {field}',
    INVALID_ENUM: '{field} must be one of: {values}',

    INVALID_EMAIL: 'Please provide a valid email address',
    INVALID_DATE: 'Please provide a valid date',
    INVALID_AMOUNT: 'Amount must be a positive number',
    INVALID_ID: 'Invalid {field}: {value}',

    PASSWORD_MIN_LENGTH: 'Password must be at least {min} characters long',
    PASSWORD_PATTERN: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character ({chars})',
} as const;

export const SYSTEM_MESSAGES = {

    OPERATION_SUCCESSFUL: 'Operation completed successfully',

    INTERNAL_ERROR: 'Internal server error',
    NOT_FOUND: 'Route {route} not found',
    VALIDATION_FAILED: 'Validation failed',
    DATABASE_ERROR: 'Database operation failed',

    TOO_MANY_REQUESTS: 'Too many requests, please try again later',
    TOO_MANY_AUTH_ATTEMPTS: 'Too many authentication attempts, please try again after 15 minutes',
    TOO_MANY_SENSITIVE_REQUESTS: 'Too many requests for this operation, please try again later',
} as const;

export const formatMessage = (message: string, params: Record<string, any>): string => {
    let formattedMessage = message;

    for (const [key, value] of Object.entries(params)) {
        formattedMessage = formattedMessage.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    }

    return formattedMessage;
};
