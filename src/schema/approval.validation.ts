import Joi from 'joi';

export const approvalDecisionSchema = Joi.object({
    decision: Joi.string()
        .valid('approved', 'rejected')
        .required(),
    comment: Joi.string().optional()
});
