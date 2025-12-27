import Joi from 'joi';

export const createUserSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string()
        .valid('employee', 'manager', 'departmenthead', 'finance', 'admin').default('employee'),
    department: Joi.string(),
    isActive: Joi.boolean().default(true)
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export const updateUserSchema = Joi.object({
    name: Joi.string().min(3).optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional(),
    role: Joi.string()
        .valid('employee', 'manager', 'departmenthead', 'finance', 'admin').optional(),
    department: Joi.string().optional(),
    isActive: Joi.boolean().optional()
});

