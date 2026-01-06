

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
        MAX: 999999999.99,
    },
    QUANTITY: {
        MIN: 1,
        MAX: 999999,
    },
} as const;

export const APPROVAL_VALIDATION = {
    COMMENT: {
        MIN_LENGTH: 5,
        MAX_LENGTH: 1000,
    },
} as const;

export const PAYMENT_VALIDATION = {
    AMOUNT: {
        MIN: 0.01,
        MAX: 999999999.99,
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

export const PAGINATION = {

    DEFAULT_PAGE_SIZE: 10,

    MAX_PAGE_SIZE: 100,

    DEFAULT_PAGE: 1,
} as const;

export const ALLOWED_VALUES = {

    USER_ROLES: ['employee', 'manager', 'departmenthead', 'finance', 'admin'] as const,

    REQUEST_STATUSES: ['draft', 'pending', 'approved', 'rejected', 'cancelled', 'completed'] as const,

    REQUEST_PRIORITIES: ['low', 'medium', 'high', 'urgent'] as const,

    APPROVAL_STATUSES: ['pending', 'approved', 'rejected'] as const,

    PAYMENT_STATUSES: ['pending', 'processing', 'completed', 'failed'] as const,

    PAYMENT_METHODS: ['bank_transfer', 'check', 'cash', 'credit_card', 'other'] as const,

    NOTIFICATION_TYPES: ['request_created', 'request_approved', 'request_rejected', 'payment_processed', 'general'] as const,
} as const;

export const VALIDATION_PATTERNS = {

    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,

    ALPHANUMERIC_EXTENDED: /^[a-zA-Z0-9\s\-_.,!?()]+$/,

    DEPARTMENT_CODE: /^[A-Z0-9_-]+$/,

    TRANSACTION_ID: /^[A-Z0-9-]+$/,

    MONGODB_OBJECT_ID: /^[a-f\d]{24}$/i,
} as const;

export const FILE_UPLOAD = {

    MAX_SIZE: 10 * 1024 * 1024,

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

    ALLOWED_EXTENSIONS: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.gif'] as const,
} as const;
