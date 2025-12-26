/**
 * Standardized API Response class for consistent response formatting
 */
export class ApiResponse {
    statusCode: number;
    success: boolean;
    message: string;
    data?: any;

    constructor(statusCode: number, message: string, data?: any) {
        this.statusCode = statusCode;
        this.success = statusCode < 400;
        this.message = message;
        this.data = data;
    }

    /**
     * Create a success response (200)
     */
    static success(message: string, data?: any): ApiResponse {
        return new ApiResponse(200, message, data);
    }

    /**
     * Create a created response (201)
     */
    static created(message: string, data?: any): ApiResponse {
        return new ApiResponse(201, message, data);
    }

    /**
     * Create a no content response (204)
     */
    static noContent(message: string = 'No content'): ApiResponse {
        return new ApiResponse(204, message);
    }

    /**
     * Send the response
     */
    send(res: any) {
        return res.status(this.statusCode).json({
            success: this.success,
            message: this.message,
            data: this.data
        });
    }
}
