import { Response } from "express";
import { HTTP_STATUS } from "../constants/http-status.constants";

interface ResponseInterface<T> {
    res: Response;
    data?: T;
    message?: string;
    statusCode?: number;
    success?: boolean;
    error?: any;
}

interface ErrorDetail {
    field?: string;
    message: string;
    code?: string;
}

export class ResponseService {
    response = <T>({
        res,
        data,
        statusCode = HTTP_STATUS.OK,
        success = true,
        message = "Request successful",
        error,
    }: ResponseInterface<T>): Response => {
        if (statusCode >= 200 && statusCode < 300) {
            success = true;
            error = undefined;
        }

        if (statusCode >= 300 && statusCode < 600) {
            success = false;
            // Don't override data with error for error responses
        }

        return res.status(statusCode).json({
            success,
            statusCode,
            message,
            data: success ? data : undefined,
            error: success ? undefined : error,
        });
    };

    // ==================== SUCCESS RESPONSES ====================

    /**
     * 200 OK - Standard success response
     */
    ok = <T>(res: Response, data: T, message: string = "Request successful"): Response => {
        return this.response({
            res,
            data,
            statusCode: HTTP_STATUS.OK,
            message,
        });
    };

    /**
     * 201 Created - Resource created successfully
     */
    created = <T>(res: Response, data: T, message: string = "Resource created successfully"): Response => {
        return this.response({
            res,
            data,
            statusCode: HTTP_STATUS.CREATED,
            message,
        });
    };

    /**
     * 204 No Content - Success with no response body
     */
    noContent = (res: Response): Response => {
        return res.status(HTTP_STATUS.NO_CONTENT).send();
    };

    badRequest = (
        res: Response,
        message: string = "Bad request",
        errors?: ErrorDetail[] | any
    ): Response => {
        return this.response({
            res,
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message,
            error: errors,
        });
    };


    unauthorized = (res: Response, message: string = "Unauthorized access"): Response => {
        return this.response({
            res,
            statusCode: HTTP_STATUS.UNAUTHORIZED,
            message,
            error: { message },
        });
    };


    forbidden = (res: Response, message: string = "Access forbidden"): Response => {
        return this.response({
            res,
            statusCode: HTTP_STATUS.FORBIDDEN,
            message,
            error: { message },
        });
    };


    notFound = (res: Response, message: string = "Resource not found"): Response => {
        return this.response({
            res,
            statusCode: HTTP_STATUS.NOT_FOUND,
            message,
            error: { message },
        });
    };

    conflict = (res: Response, message: string = "Resource conflict", details?: any): Response => {
        return this.response({
            res,
            statusCode: HTTP_STATUS.CONFLICT,
            message,
            error: details || { message },
        });
    };

    unprocessableEntity = (
        res: Response,
        message: string = "Validation failed",
        errors?: ErrorDetail[] | any
    ): Response => {
        return this.response({
            res,
            statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
            message,
            error: errors,
        });
    };

    /**
     * 500 Internal Server Error - Server error
     */
    internalServerError = (
        res: Response,
        message: string = "Internal server error",
        error?: any
    ): Response => {

        const errorDetails = process.env.NODE_ENV === "production"
            ? { message: "An unexpected error occurred" }
            : error;

        return this.response({
            res,
            statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message,
            error: errorDetails,
        });
    };
    serviceUnavailable = (
        res: Response,
        message: string = "Service temporarily unavailable"
    ): Response => {
        return this.response({
            res,
            statusCode: HTTP_STATUS.SERVICE_UNAVAILABLE,
            message,
            error: { message },
        });
    };
}

export const responseService = new ResponseService();
