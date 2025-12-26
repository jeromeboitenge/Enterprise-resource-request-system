import Joi from 'joi';

export const createRequestSchema = Joi.object({
    resourceName: Joi.string().min(3).required(),
    description: Joi.string().optional(),
    amountRequested: Joi.number().positive().required(),
    departmentId: Joi.string().required()
});

export const updateRequestStatusSchema = Joi.object({
    status: Joi.string()
        .valid('approved', 'rejected')
        .required(),
    comment: Joi.string().optional()
});
