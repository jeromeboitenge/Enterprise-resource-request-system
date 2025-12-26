import Joi from 'joi';

export const paymentSchema = Joi.object({
    requestId: Joi.string().required(),
    amountPaid: Joi.number().positive().required(),
    paymentMethod: Joi.string()
        .valid('bank', 'mobile_money', 'cash')
        .required()
});
