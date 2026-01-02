import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * Request ID Middleware
 * 
 * Generates a unique identifier (UUID) for each incoming request and attaches it to:
 * - The request object (req.id) for use in application logic
 * - The response headers (X-Request-ID) for client-side tracking
 * 
 * Benefits:
 * - **Request Tracing**: Track a single request through the entire application lifecycle
 * - **Log Correlation**: Correlate log entries from different parts of the application
 * - **Debugging**: Easier to debug issues by following a specific request ID
 * - **Client Tracking**: Clients can reference the request ID when reporting issues
 * 
 * @example
 * ```typescript
 * // In your server.ts
 * app.use(requestIdMiddleware);
 * 
 * // In your controllers or middleware
 * console.log(`Processing request ${req.id}`);
 * 
 * // Client receives the ID in response headers
 * // X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
 * ```
 */

// Extend Express Request interface to include request ID
declare global {
    namespace Express {
        interface Request {
            /**
             * Unique identifier for this request
             * Generated using UUID v4
             */
            id: string;
        }
    }
}

/**
 * Middleware function to add unique request ID to all requests
 * 
 * The middleware:
 * 1. Checks if client provided a request ID in X-Request-ID header
 * 2. If not, generates a new UUID v4
 * 3. Attaches the ID to req.id
 * 4. Adds the ID to response headers
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const requestIdMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Check if client provided a request ID (useful for distributed tracing)
    const clientRequestId = req.headers['x-request-id'] as string;

    // Use client-provided ID if valid, otherwise generate new UUID
    const requestId = clientRequestId && isValidUUID(clientRequestId)
        ? clientRequestId
        : randomUUID();

    // Attach request ID to request object
    req.id = requestId;

    // Add request ID to response headers
    res.setHeader('X-Request-ID', requestId);

    next();
};

/**
 * Validates if a string is a valid UUID (v4)
 * 
 * @param uuid - String to validate
 * @returns True if valid UUID, false otherwise
 * 
 * @example
 * ```typescript
 * isValidUUID('550e8400-e29b-41d4-a716-446655440000') // true
 * isValidUUID('invalid-uuid') // false
 * ```
 */
const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};
