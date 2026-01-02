import winston from 'winston';
import { Request } from 'express';

const { combine, timestamp, printf, colorize, errors } = winston.format;

/**
 * Sensitive fields that should be redacted from logs
 * These fields will be replaced with '[REDACTED]' in log output
 */
const SENSITIVE_FIELDS = [
    'password',
    'token',
    'refreshToken',
    'accessToken',
    'authorization',
    'cookie',
    'secret',
    'apiKey',
    'creditCard',
    'ssn',
];

/**
 * Sanitizes log data by redacting sensitive information
 * 
 * This prevents accidental logging of passwords, tokens, and other sensitive data
 * that could pose a security risk if logs are compromised.
 * 
 * @param data - Data object to sanitize
 * @returns Sanitized data with sensitive fields redacted
 */
const sanitizeLogData = (data: any): any => {
    if (data === null || data === undefined) return data;

    if (typeof data === 'string') {
        // Don't log very long strings (might be tokens or large payloads)
        return data.length > 500 ? `[TRUNCATED: ${data.length} chars]` : data;
    }

    if (Array.isArray(data)) {
        return data.map(sanitizeLogData);
    }

    if (typeof data === 'object') {
        const sanitized: any = {};

        for (const [key, value] of Object.entries(data)) {
            // Check if field name contains sensitive keywords
            const isSensitive = SENSITIVE_FIELDS.some(field =>
                key.toLowerCase().includes(field.toLowerCase())
            );

            if (isSensitive) {
                sanitized[key] = '[REDACTED]';
            } else {
                sanitized[key] = sanitizeLogData(value);
            }
        }

        return sanitized;
    }

    return data;
};

/**
 * Custom log format with request ID support
 * 
 * Format: YYYY-MM-DD HH:mm:ss [LEVEL] [REQUEST_ID]: message
 */
const logFormat = printf(({ level, message, timestamp, requestId, stack, ...metadata }) => {
    // Build base message with timestamp and level
    let msg = `${timestamp} [${level}]`;

    // Add request ID if present
    if (requestId) {
        msg += ` [${requestId}]`;
    }

    // Add main message
    msg += `: ${message}`;

    // Add stack trace for errors
    if (stack) {
        msg += `\n${stack}`;
    }

    // Add sanitized metadata if present
    const sanitizedMetadata = sanitizeLogData(metadata);
    if (Object.keys(sanitizedMetadata).length > 0) {
        msg += `\n${JSON.stringify(sanitizedMetadata, null, 2)}`;
    }

    return msg;
});

/**
 * Main application logger
 * 
 * Usage:
 * ```typescript
 * import logger from '@/utils/logger';
 * 
 * logger.info('User logged in', { userId: user.id });
 * logger.error('Database connection failed', { error: err.message });
 * logger.debug('Processing request', { requestId: req.id });
 * ```
 */
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
        errors({ stack: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [
        // Console transport for all environments
        new winston.transports.Console({
            format: combine(
                colorize(),
                logFormat
            )
        })
    ],
    // Don't exit on handled exceptions
    exitOnError: false
});

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
    logger.add(
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    );

    logger.add(
        new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    );
}

/**
 * Security-specific logger
 * 
 * Logs authentication and authorization events to a separate file for audit purposes.
 * In production, these logs are stored separately for easier security monitoring.
 * 
 * Usage:
 * ```typescript
 * import { securityLogger } from '@/utils/logger';
 * 
 * securityLogger.info('Failed login attempt', {
 *   email: 'user@example.com',
 *   ip: req.ip,
 *   userAgent: req.get('user-agent')
 * });
 * ```
 */
export const securityLogger = winston.createLogger({
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [
        // Console in development
        new winston.transports.Console({
            format: combine(
                colorize(),
                logFormat
            )
        })
    ],
    exitOnError: false
});

// Add security log file in production
if (process.env.NODE_ENV === 'production') {
    securityLogger.add(
        new winston.transports.File({
            filename: 'logs/security.log',
            maxsize: 5242880, // 5MB
            maxFiles: 10 // Keep more security logs
        })
    );
}

/**
 * Helper function to log security events with request context
 * 
 * Automatically extracts and logs relevant security information from the request:
 * - Request ID
 * - IP address
 * - User agent
 * - User ID (if authenticated)
 * 
 * @param event - Security event name (e.g., 'login_failed', 'account_locked')
 * @param req - Express request object
 * @param additionalData - Additional data to log
 * 
 * @example
 * ```typescript
 * logSecurityEvent('login_failed', req, {
 *   email: 'user@example.com',
 *   reason: 'invalid_password'
 * });
 * ```
 */
export const logSecurityEvent = (
    event: string,
    req: Request,
    additionalData?: Record<string, any>
): void => {
    securityLogger.info(event, {
        requestId: req.id,
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.get('user-agent'),
        userId: req.user?._id,
        ...sanitizeLogData(additionalData || {})
    });
};

/**
 * Helper function to create a child logger with request context
 * 
 * Creates a logger instance that automatically includes request ID in all log entries.
 * Useful for maintaining context throughout request processing.
 * 
 * @param req - Express request object
 * @returns Child logger with request context
 * 
 * @example
 * ```typescript
 * const reqLogger = createRequestLogger(req);
 * reqLogger.info('Processing payment'); // Automatically includes request ID
 * ```
 */
export const createRequestLogger = (req: Request): winston.Logger => {
    return logger.child({ requestId: req.id });
};

export default logger;

