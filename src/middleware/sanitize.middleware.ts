import mongoSanitize from 'express-mongo-sanitize';
import { Request, Response, NextFunction } from 'express';

export const sanitizeInput = mongoSanitize({
    replaceWith: '_', // Replace prohibited characters with underscore
    onSanitize: ({ req, key }) => {
        console.warn(`Sanitized potentially malicious input: ${key} in ${req.path}`);
    }
});

export const customSanitize = (req: Request, res: Response, next: NextFunction) => {

    const sanitizeString = (str: string): string => {
        if (typeof str !== 'string') return str;

        return str
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
            .trim();
    };

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
