/**
 * Validation Constants
 * 
 * This file centralizes all validation rules and limits used throughout the application.
 * These constants are used in Joi validation schemas and other validation logic.
 * 
 * @module constants/validation
 */

/**
 * User field validation rules
 */
export const USER_VALIDATION = {
    NAME: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 100,
    },
    EMAIL: {
        MAX_LENGTH: 255,
    },
    PASSWORD: {
        MIN_LENGTH: 8,
        MAX_LENGTH: 128,
    },
    DEPARTMENT: {
        MAX_LENGTH: 100,
    },
} as const;

/**
 * Request field validation rules
 */
export const REQUEST_VALIDATION = {
    TITLE: {
        MIN_LENGTH: 5,
        MAX_LENGTH: 200,
    },
    DESCRIPTION: {
        MIN_LENGTH: 10,
        MAX_LENGTH: 2000,
    },
    JUSTIFICATION: {
        MIN_LENGTH: 10,
        MAX_LENGTH: 1000,
    },
    ESTIMATED_COST: {
        MIN: 0,
        MAX: 999999999.99, // ~1 billion
    },
    QUANTITY: {
        MIN: 1,
        MAX: 999999,
    },
} as const;

/**
 * Approval field validation rules
 */
export const APPROVAL_VALIDATION = {
    COMMENT: {
        MIN_LENGTH: 5,
        MAX_LENGTH: 1000,
    },
} as const;

/**
 * Payment field validation rules
 */
export const PAYMENT_VALIDATION = {
    AMOUNT: {
        MIN: 0.01,
        MAX: 999999999.99, // ~1 billion
    },
    TRANSACTION_ID: {
        MIN_LENGTH: 5,
        MAX_LENGTH: 100,
    },
    PAYMENT_METHOD: {
        MAX_LENGTH: 50,
    },
    NOTES: {
        MAX_LENGTH: 500,
    },
} as const;

/**
 * Department field validation rules
 */
export const DEPARTMENT_VALIDATION = {
    NAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 100,
    },
    CODE: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 20,
    },
    DESCRIPTION: {
        MAX_LENGTH: 500,
    },
    BUDGET: {
        MIN: 0,
        MAX: 999999999.99,
    },
} as const;

/**
 * Notification field validation rules
 */
export const NOTIFICATION_VALIDATION = {
    TITLE: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 200,
    },
    MESSAGE: {
        MIN_LENGTH: 5,
        MAX_LENGTH: 1000,
    },
} as const;

/**
 * Pagination defaults and limits
 */
export const PAGINATION = {
    /**
     * Default number of items per page
     */
    DEFAULT_PAGE_SIZE: 10,

    /**
     * Maximum number of items per page
     */
    MAX_PAGE_SIZE: 100,

    /**
     * Default page number
     */
    DEFAULT_PAGE: 1,
} as const;

/**
 * Allowed values for enum fields
 */
export const ALLOWED_VALUES = {
    /**
     * User roles
     */
    USER_ROLES: ['employee', 'manager', 'departmenthead', 'finance', 'admin'] as const,

    /**
     * Request statuses
     */
    REQUEST_STATUSES: ['draft', 'pending', 'approved', 'rejected', 'cancelled', 'completed'] as const,

    /**
     * Request priorities
     */
    REQUEST_PRIORITIES: ['low', 'medium', 'high', 'urgent'] as const,

    /**
     * Approval statuses
     */
    APPROVAL_STATUSES: ['pending', 'approved', 'rejected'] as const,

    /**
     * Payment statuses
     */
    PAYMENT_STATUSES: ['pending', 'processing', 'completed', 'failed'] as const,

    /**
     * Payment methods
     */
    PAYMENT_METHODS: ['bank_transfer', 'check', 'cash', 'credit_card', 'other'] as const,

    /**
     * Notification types
     */
    NOTIFICATION_TYPES: ['request_created', 'request_approved', 'request_rejected', 'payment_processed', 'general'] as const,
} as const;

/**
 * Regular expression patterns for validation
 */
export const VALIDATION_PATTERNS = {
    /**
     * Email pattern (basic validation, Joi handles more complex validation)
     */
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    /**
     * Password pattern
     * Requires: min 8 chars, uppercase, lowercase, number, special character
     */
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,

    /**
     * Alphanumeric with spaces and common punctuation
     */
    ALPHANUMERIC_EXTENDED: /^[a-zA-Z0-9\s\-_.,!?()]+$/,

    /**
     * Department code (alphanumeric, uppercase, no spaces)
     */
    DEPARTMENT_CODE: /^[A-Z0-9_-]+$/,

    /**
     * Transaction ID (alphanumeric with hyphens)
     */
    TRANSACTION_ID: /^[A-Z0-9-]+$/,

    /**
     * MongoDB ObjectId pattern
     */
    MONGODB_OBJECT_ID: /^[a-f\d]{24}$/i,
} as const;

/**
 * File upload validation (if needed in the future)
 */
export const FILE_UPLOAD = {
    /**
     * Maximum file size in bytes (10MB)
     */
    MAX_SIZE: 10 * 1024 * 1024,

    /**
     * Allowed file types for attachments
     */
    ALLOWED_TYPES: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/gif',
    ] as const,

    /**
     * Allowed file extensions
     */
    ALLOWED_EXTENSIONS: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.gif'] as const,
} as const;
