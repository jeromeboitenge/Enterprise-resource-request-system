

export const ACCOUNT_LOCKOUT = {

    MAX_LOGIN_ATTEMPTS: 10,

    LOCK_DURATION_MS: 1 * 60 * 1000,

    LOCK_DURATION_MINUTES: 15,
} as const;

export const PASSWORD_POLICY = {

    MIN_LENGTH: 8,

    MAX_LENGTH: 128,

    REQUIRE_UPPERCASE: true,

    REQUIRE_LOWERCASE: true,

    REQUIRE_NUMBER: true,

    REQUIRE_SPECIAL_CHAR: true,

    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,

    ALLOWED_SPECIAL_CHARS: '@$!%*?&',
} as const;

export const JWT_CONFIG = {

    DEFAULT_EXPIRES_IN: '1d',

    REFRESH_TOKEN_EXPIRES_IN: '1d',

    TOKEN_TYPE: 'Bearer',
} as const;

export const RATE_LIMIT = {

    AUTH: {

        WINDOW_MS: 15 * 60 * 1000,

        MAX_REQUESTS: 5,

        MESSAGE: 'Too many authentication attempts, please try again after 15 minutes',
    },

    API: {

        WINDOW_MS: 15 * 60 * 1000,

        MAX_REQUESTS: 100,

        MESSAGE: 'Too many requests, please try again later',
    },

    STRICT: {

        WINDOW_MS: 60 * 60 * 1000,

        MAX_REQUESTS: 3,

        MESSAGE: 'Too many requests for this operation, please try again later',
    },
} as const;

export const HASHING = {

    SALT_ROUNDS: 12,
} as const;

export const SESSION = {

    MAX_CONCURRENT_SESSIONS: 0,

    TIMEOUT_MS: 24 * 60 * 60 * 1000,
} as const;

export const SECURITY_HEADERS = {

    CSP: {
        DEFAULT_SRC: ["'self'"],
        STYLE_SRC: ["'self'", "'unsafe-inline'"],
        SCRIPT_SRC: ["'self'"],
        IMG_SRC: ["'self'", "data:", "https:"],
    },

    HSTS: {

        MAX_AGE: 365 * 24 * 60 * 60,

        INCLUDE_SUBDOMAINS: true,

        PRELOAD: true,
    },
} as const;

export const REQUEST_LIMITS = {

    JSON_LIMIT: '10mb',

    URLENCODED_LIMIT: '10mb',
} as const;
