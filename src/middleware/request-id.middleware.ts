import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';


export const requestIdMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {

    const clientRequestId = req.headers['x-request-id'] as string;

    const requestId = clientRequestId && isValidUUID(clientRequestId)
        ? clientRequestId
        : randomUUID();

    req.id = requestId;

    res.setHeader('X-Request-ID', requestId);

    next();
};

const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};
