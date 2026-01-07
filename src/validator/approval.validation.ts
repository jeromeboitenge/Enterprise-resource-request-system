import Joi from 'joi';

export const approvalDecisionSchema = Joi.object({
    comment: Joi.string().optional().allow('').max(500)
});
