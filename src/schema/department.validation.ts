import Joi from 'joi';

export const createDepartmentSchema = Joi.object({
    name: Joi.string().min(2).required(),
    description: Joi.string().optional()
});
