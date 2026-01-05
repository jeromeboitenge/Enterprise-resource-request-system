import Joi from 'joi';
import logger from '../utils/logger';

/**
 * Environment variable schema
 */
const envSchema = Joi.object({
    // Server configuration
    PORT: Joi.number().default(5500),
    PREFIX: Joi.string().default('/api/v1'),
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),

    // Database configuration
    DB_URL: Joi.string().required(),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),

    // JWT configuration
    JWT_SECRET: Joi.string().min(32).required(),
    JWT_EXPIRES_IN: Joi.string().default('1d'),

    // CORS configuration
    CORS_ORIGIN: Joi.string().default('*'),

    // Rate limiting (optional, has defaults)
    RATE_LIMIT_WINDOW_MS: Joi.number().default(15 * 60 * 1000),
    RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100)
}).unknown(true); // Allow other environment variables


export const validateEnv = (): void => {
    const { error, value } = envSchema.validate(process.env, {
        abortEarly: false,
        stripUnknown: false
    });

    if (error) {
        const errorMessages = error.details.map(detail => {
            return `  - ${detail.message}`;
        }).join('\n');

        logger.error(' Environment validation failed:\n' + errorMessages);

        throw new Error(
            `Environment validation failed. Please check your .env file:\n${errorMessages}`
        );
    }

    logger.info(' Environment variables validated successfully');
};
