import mongoSanitize from 'express-mongo-sanitize';
import { Request, Response, NextFunction } from 'express';

/**
 * Sanitize middleware to prevent NoSQL injection attacks
 * Removes any keys that start with '$' or contain '.'
 */
export const sanitizeInput = mongoSanitize({
    replaceWith: '_', // Replace prohibited characters with underscore
    onSanitize: ({ req, key }) => {
        console.warn(`Sanitized potentially malicious input: ${key} in ${req.path}`);
    }
});

/**
 * Additional custom sanitization for specific attack patterns
 */
export const customSanitize = (req: Request, res: Response, next: NextFunction) => {
    // Sanitize common XSS patterns in strings
    const sanitizeString = (str: string): string => {
        if (typeof str !== 'string') return str;

        // Remove script tags and event handlers
        return str
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
            .trim();
    };

    // Recursively sanitize object
    const sanitizeObject = (obj: any): any => {
        if (obj === null || obj === undefined) return obj;

        if (typeof obj === 'string') {
            return sanitizeString(obj);
        }

        if (Array.isArray(obj)) {
            return obj.map(sanitizeObject);
        }

        if (typeof obj === 'object') {
            const sanitized: any = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    sanitized[key] = sanitizeObject(obj[key]);
                }
            }
            return sanitized;
        }

        return obj;
    };

    // Sanitize request body, query, and params
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    if (req.query) {
        req.query = sanitizeObject(req.query);
    }
    if (req.params) {
        req.params = sanitizeObject(req.params);
    }

    next();
};
