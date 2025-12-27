import Joi from 'joi';

export const createRequestSchema = Joi.object({
    title: Joi.string().min(3).required(),
    resourceName: Joi.string().min(3).required(),
    resourceType: Joi.string().required(),
    description: Joi.string().optional(),
    quantity: Joi.number().integer().min(1).required(),
    estimatedCost: Joi.number().min(0).required(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
    departmentId: Joi.string().required()
});

export const updateRequestSchema = Joi.object({
    title: Joi.string().min(3).optional(),
    resourceName: Joi.string().min(3).optional(),
    resourceType: Joi.string().optional(),
    description: Joi.string().optional(),
    quantity: Joi.number().integer().min(1).optional(),
    estimatedCost: Joi.number().min(0).optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
    status: Joi.string()
        .valid('draft', 'submitted', 'under_review', 'approved', 'rejected', 'funded', 'fulfilled', 'cancelled')
        .optional()
});

export const updateRequestStatusSchema = Joi.object({
    status: Joi.string()
        .valid('approved', 'rejected')
        .required(),
    comment: Joi.string().optional()
});
