/**
 * Security Configuration Constants
 * 
 * This file centralizes all security-related configuration values used throughout the application.
 * Centralizing these values makes them easier to audit, modify, and maintain.
 * 
 * @module constants/security
 */

/**
 * Account Lockout Configuration
 * Protects against brute force attacks by locking accounts after multiple failed login attempts
 */
export const ACCOUNT_LOCKOUT = {
    /**
     * Maximum number of failed login attempts before account is locked
     * @default 5
     */
    MAX_LOGIN_ATTEMPTS: 10,

    /**
     * Duration of account lockout in milliseconds (15 minutes)
     * After this period, the account will automatically unlock
     * @default 100000 (15 minutes)
     */
    LOCK_DURATION_MS: 1 * 60 * 1000,

    /**
     * Duration of account lockout in minutes (for display purposes)
     * @default 15
     */
    LOCK_DURATION_MINUTES: 15,
} as const;

/**
 * Password Policy Requirements
 * Enforces strong password creation to enhance account security
 */
export const PASSWORD_POLICY = {
    /**
     * Minimum password length
     * @default 8
     */
    MIN_LENGTH: 8,

    /**
     * Maximum password length
     * @default 128
     */
    MAX_LENGTH: 128,

    /**
     * Requires at least one uppercase letter (A-Z)
     * @default true
     */
    REQUIRE_UPPERCASE: true,

    /**
     * Requires at least one lowercase letter (a-z)
     * @default true
     */
    REQUIRE_LOWERCASE: true,

    /**
     * Requires at least one number (0-9)
     * @default true
     */
    REQUIRE_NUMBER: true,

    /**
     * Requires at least one special character
     * Allowed special characters: @$!%*?&
     * @default true
     */
    REQUIRE_SPECIAL_CHAR: true,

    /**
     * Regular expression pattern for password validation
     * Ensures password contains at least one uppercase, lowercase, number, and special character
     */
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,

    /**
     * Allowed special characters in passwords
     * @default '@$!%*?&'
     */
    ALLOWED_SPECIAL_CHARS: '@$!%*?&',
} as const;

/**
 * JWT (JSON Web Token) Configuration
 * Controls token generation and validation for authentication
 */
export const JWT_CONFIG = {
    /**
     * Default token expiration time
     * @default '1d' (1 day)
     */
    DEFAULT_EXPIRES_IN: '1d',

    /**
     * Refresh token expiration time
     * @default '7d' (7 days)
     */
    REFRESH_TOKEN_EXPIRES_IN: '7d',

    /**
     * Token type prefix for Authorization header
     * @default 'Bearer'
     */
    TOKEN_TYPE: 'Bearer',
} as const;

/**
 * Rate Limiting Configuration
 * Prevents abuse by limiting the number of requests from a single IP address
 */
export const RATE_LIMIT = {
    /**
     * Authentication endpoints rate limit
     * Stricter limits to prevent brute force attacks
     */
    AUTH: {
        /**
         * Time window in milliseconds (15 minutes)
         * @default 900000
         */
        WINDOW_MS: 15 * 60 * 1000,

        /**
         * Maximum requests per window
         * @default 5
         */
        MAX_REQUESTS: 5,

        /**
         * Error message when limit is exceeded
         */
        MESSAGE: 'Too many authentication attempts, please try again after 15 minutes',
    },

    /**
     * General API endpoints rate limit
     * More lenient for normal operations
     */
    API: {
        /**
         * Time window in milliseconds (15 minutes)
         * @default 900000
         */
        WINDOW_MS: 15 * 60 * 1000,

        /**
         * Maximum requests per window
         * @default 100
         */
        MAX_REQUESTS: 100,

        /**
         * Error message when limit is exceeded
         */
        MESSAGE: 'Too many requests, please try again later',
    },

    /**
     * Strict rate limit for sensitive operations
     * Used for password changes, account modifications, etc.
     */
    STRICT: {
        /**
         * Time window in milliseconds (1 hour)
         * @default 3600000
         */
        WINDOW_MS: 60 * 60 * 1000,

        /**
         * Maximum requests per window
         * @default 3
         */
        MAX_REQUESTS: 3,

        /**
         * Error message when limit is exceeded
         */
        MESSAGE: 'Too many requests for this operation, please try again later',
    },
} as const;

/**
 * Password Hashing Configuration
 * Controls bcrypt hashing parameters
 */
export const HASHING = {
    /**
     * Number of salt rounds for bcrypt
     * Higher values increase security but also increase processing time
     * @default 12
     */
    SALT_ROUNDS: 12,
} as const;

/**
 * Session Management
 */
export const SESSION = {
    /**
     * Maximum number of concurrent sessions per user
     * Set to 0 for unlimited sessions
     * @default 0
     */
    MAX_CONCURRENT_SESSIONS: 0,

    /**
     * Session timeout in milliseconds (24 hours)
     * @default 86400000
     */
    TIMEOUT_MS: 24 * 60 * 60 * 1000,
} as const;

/**
 * Security Headers Configuration
 * Additional security headers beyond Helmet defaults
 */
export const SECURITY_HEADERS = {
    /**
     * Content Security Policy directives
     */
    CSP: {
        DEFAULT_SRC: ["'self'"],
        STYLE_SRC: ["'self'", "'unsafe-inline'"],
        SCRIPT_SRC: ["'self'"],
        IMG_SRC: ["'self'", "data:", "https:"],
    },

    /**
     * HTTP Strict Transport Security (HSTS) configuration
     */
    HSTS: {
        /**
         * Max age in seconds (1 year)
         * @default 31536000
         */
        MAX_AGE: 365 * 24 * 60 * 60,

        /**
         * Include subdomains in HSTS policy
         * @default true
         */
        INCLUDE_SUBDOMAINS: true,

        /**
         * Enable HSTS preload
         * @default true
         */
        PRELOAD: true,
    },
} as const;

/**
 * Request Size Limits
 * Prevents denial of service attacks via large payloads
 */
export const REQUEST_LIMITS = {
    /**
     * Maximum JSON body size
     * @default '10mb'
     */
    JSON_LIMIT: '10mb',

    /**
     * Maximum URL-encoded body size
     * @default '10mb'
     */
    URLENCODED_LIMIT: '10mb',
} as const;
