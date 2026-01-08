import { Response } from "express";

interface ResponseInterface<T> {
    res: Response;
    data?: T;
    message?: string;
    statusCode?: number;
    success?: boolean;
    error?: any;
}

export class ResponseService {
    response = <T>({
        res,
        data,
        statusCode = 200,
        success = true,
        message = "Fetched well",
        error,
    }: ResponseInterface<T>): Response => {
        if (statusCode > 200 && statusCode < 299) {
            success = true;
            error = undefined;
        }
        if (statusCode > 300 && statusCode < 599) {
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