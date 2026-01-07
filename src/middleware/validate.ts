import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';

export const validate =
    (schema: ObjectSchema, property: 'body' | 'params' = 'body') =>
        (req: Request, res: Response, next: NextFunction): void => {
            const { error } = schema.validate(req[property], { abortEarly: false });

            if (error) {
                res.status(400).json({
                    message: 'Validation error',
                    errors: error.details.map(d => d.message)
                });
                return;
            }

            next();
        };
