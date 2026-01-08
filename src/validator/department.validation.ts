import Joi from 'joi';

export const createDepartmentSchema = Joi.object({
    name: Joi.string().min(2).required(),
    description: Joi.string().optional(),
    headId: Joi.string().optional()
});

export const updateDepartmentSchema = Joi.object({
    name: Joi.string().min(2).optional(),
    description: Joi.string().optional(),
    headId: Joi.string().optional()
});

