import Joi from 'joi';

export const processPaymentSchema = Joi.object({
    amountPaid: Joi.number().positive().required(),
    paymentMethod: Joi.string()
        .valid('bank', 'mobile_money', 'cash')
        .required()
});
