import Joi from 'joi';

const passwordSchema = Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
        'any.required': 'Password is required'
    });

const emailSchema = Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    });

export const createUserSchema = Joi.object({
    name: Joi.string().min(3).max(100).trim().required().messages({
        'string.min': 'Name must be at least 3 characters long',
        'string.max': 'Name cannot exceed 100 characters',
        'any.required': 'Name is required'
    }),
    email: emailSchema,
    password: passwordSchema,
    role: Joi.string()
        .valid('employee', 'manager', 'departmenthead', 'finance', 'admin')
        .default('employee'),
    department: Joi.string().trim().optional(),
    isActive: Joi.boolean().default(true)
});

export const loginSchema = Joi.object({
    email: emailSchema,
    password: Joi.string().required().messages({
        'any.required': 'Password is required'
    })
});

export const updateUserSchema = Joi.object({
    name: Joi.string().min(3).max(100).trim().optional(),
    email: emailSchema.optional(),
    role: Joi.string()
        .valid('employee', 'manager', 'departmenthead', 'finance', 'admin')
        .optional(),
    department: Joi.string().trim().optional(),
    isActive: Joi.boolean().optional()
});

export const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required().messages({
        'any.required': 'Current password is required'
    }),
    newPassword: passwordSchema,
    confirmPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
            'any.only': 'Passwords do not match',
            'any.required': 'Password confirmation is required'
        })
});

export const resetPasswordSchema = Joi.object({
    newPassword: passwordSchema,
    confirmPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
            'any.only': 'Passwords do not match',
            'any.required': 'Password confirmation is required'
        })
});
export const resetPasswordWithEmailSchema = Joi.object({
    email: emailSchema,
    newPassword: passwordSchema,
    confirmPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .optional() // Optional for now to maintain backward compatibility with current testing, or can be required. User didn't ask for it.
        .messages({
            'any.only': 'Passwords do not match'
        })
});
