import { Response } from "express";

/**
 * Generic Response Interface
 * 
 * Defines the structure for all API responses to ensure consistency
 * across the application.
 * 
 * @template T - The type of data being returned
 */
interface ResponseInterface<T> {
    /**
     * Express response object
     */
    res: Response;

    /**
     * Data to be returned in the response
     */
    data?: T;

    /**
     * Human-readable message describing the response
     */
    message?: string;

    /**
     * HTTP status code
     * @default 200
     */
    statusCode?: number;

    /**
     * Indicates if the request was successful
     * @default true
     */
    success?: boolean;

    /**
     * Error details (only present when success is false)
     */
    error?: any;
}

/**
 * Response Service
 * 
 * Centralized service for handling all API responses.
 * Ensures consistent response format across all endpoints.
 * 
 * **Response Format**:
 * ```json
 * {
 *   "data": <response data>,
 *   "success": true/false,
 *   "statusCode": 200,
 *   "message": "Success message",
 *   "error": <error details if any>
 * }
 * ```
 * 
 * **Usage**:
 * ```typescript
 * const responseService = new ResponseService();
 * 
 * // Success response
 * return responseService.response({
 *   res,
 *   data: { user },
 *   message: "User created successfully",
 *   statusCode: 201
 * });
 * 
 * // Error response
 * return responseService.response({
 *   res,
 *   data: errorDetails,
 *   message: "Validation failed",
 *   statusCode: 400
 * });
 * ```
 */
export class ResponseService {
    /**
     * Send a formatted response
     * 
     * Automatically determines success/error based on status code:
     * - 200-299: Success (success = true, error = undefined)
     * - 300-599: Error (success = false, error = data)
     * 
     * @template T - Type of data being returned
     * @param params - Response parameters
     * @returns Express Response object
     * 
     * @example
     * ```typescript
     * // Success response
     * responseService.response({
     *   res,
     *   data: { users: [...] },
     *   message: "Users retrieved successfully",
     *   statusCode: 200
     * });
     * 
     * // Created response
     * responseService.response({
     *   res,
     *   data: { user },
     *   message: "User created successfully",
     *   statusCode: 201
     * });
     * 
     * // Error response
     * responseService.response({
     *   res,
     *   data: { field: "email", message: "Invalid email" },
     *   message: "Validation failed",
     *   statusCode: 400
     * });
     * ```
     */
    response = <T>({
        res,
        data,
        statusCode = 200,
        success = true,
        message = "Fetched well",
        error,
    }: ResponseInterface<T>): Response => {
        // Automatically set success to true for 2xx status codes
        if (statusCode >= 200 && statusCode < 300) {
            success = true;
            error = undefined;
        }

        // Automatically set success to false for error status codes
        if (statusCode >= 300 && statusCode < 600) {
            success = false;
            error = data;
        }

        return res.status(statusCode).json({
            data,
            success,
            statusCode,
            message,
            error,
        });
    };
}

/**
 * Export a singleton instance for convenience
 * 
 * @example
 * ```typescript
 * import { responseService } from '@/utils/ResponseService';
 * 
 * return responseService.response({
 *   res,
 *   data: { user },
 *   message: "Success"
 * });
 * ```
 */
export const responseService = new ResponseService();
