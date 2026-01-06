import winston from 'winston';
import { Request } from 'express';

const { combine, timestamp, printf, colorize, errors } = winston.format;

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

const sanitizeLogData = (data: any): any => {
    if (data === null || data === undefined) return data;

    if (typeof data === 'string') {

        return data.length > 500 ? `[TRUNCATED: ${data.length} chars]` : data;
    }

    if (Array.isArray(data)) {
        return data.map(sanitizeLogData);
    }

    if (typeof data === 'object') {
        const sanitized: any = {};

        for (const [key, value] of Object.entries(data)) {

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

const logFormat = printf(({ level, message, timestamp, requestId, stack, ...metadata }) => {

    let msg = `${timestamp} [${level}]`;

    if (requestId) {
        msg += ` [${requestId}]`;
    }

    msg += `: ${message}`;

    if (stack) {
        msg += `\n${stack}`;
    }

    const sanitizedMetadata = sanitizeLogData(metadata);
    if (Object.keys(sanitizedMetadata).length > 0) {
        msg += `\n${JSON.stringify(sanitizedMetadata, null, 2)}`;
    }

    return msg;
});

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
        errors({ stack: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [

        new winston.transports.Console({
            format: combine(
                colorize(),
                logFormat
            )
        })
    ],

    exitOnError: false
});

if (process.env.NODE_ENV === 'production') {
    logger.add(
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880,
            maxFiles: 5
        })
    );

    logger.add(
        new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880,
            maxFiles: 5
        })
    );
}

export const securityLogger = winston.createLogger({
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [

        new winston.transports.Console({
            format: combine(
                colorize(),
                logFormat
            )
        })
    ],
    exitOnError: false
});

if (process.env.NODE_ENV === 'production') {
    securityLogger.add(
        new winston.transports.File({
            filename: 'logs/security.log',
            maxsize: 5242880,
            maxFiles: 10
        })
    );
}

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

export const createRequestLogger = (req: Request): winston.Logger => {
    return logger.child({ requestId: req.id });
};

export default logger;

