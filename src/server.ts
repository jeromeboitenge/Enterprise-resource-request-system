import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "dotenv/config";

import { config, databaseConnection } from "./config";
import { validateEnv } from "./config/env.validator";
import { mainRouter } from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rate-limiter.middleware";
import { sanitizeInput, customSanitize } from "./middleware/sanitize.middleware";
import { requestIdMiddleware } from "./middleware/request-id.middleware";
import logger from "./utils/logger";

try {
    validateEnv();
} catch (error) {
    console.error('❌ Environment validation failed:', error);
    process.exit(1);
}

const app: Express = express();

app.use(requestIdMiddleware);

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],           // Only load resources from same origin
            styleSrc: ["'self'", "'unsafe-inline'"],  // Allow inline styles (needed for some frameworks)
            scriptSrc: ["'self'"],            // Only execute scripts from same origin
            imgSrc: ["'self'", "data:", "https:"],  // Allow images from same origin, data URIs, and HTTPS
        }
    },
    hsts: {
        maxAge: 31536000,        // 1 year in seconds
        includeSubDomains: true, // Apply to all subdomains
        preload: true            // Enable HSTS preload list
    }
}));

const corsOrigins = process.env.CORS_ORIGIN?.split(',') || ['*'];
app.use(
    cors({
        origin: corsOrigins.includes('*') ? '*' : corsOrigins,
        credentials: true,  // Allow cookies and authorization headers
    })
);

app.use(morgan("combined", {
    stream: {
        write: (message: string) => logger.info(message.trim())
    }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(sanitizeInput);
app.use(customSanitize);

app.use(config.prefix, apiLimiter);

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Enterprise Resource Request System API",
        version: "1.0.0",
        status: "running",
    });
});

app.use(config.prefix, mainRouter);

app.use(notFoundHandler);

app.use(errorHandler);

const startServer = async () => {
    try {

        await databaseConnection();

        app.listen(config.port, () => {
            logger.info(`🚀 Server running on port ${config.port}`);
            logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`🔒 CORS Origins: ${corsOrigins.join(', ')}`);
            logger.info(`🛡️  Security: Helmet, Rate Limiting, Input Sanitization enabled`);
            logger.info(`📊 Request ID tracking enabled`);
        });
    } catch (error) {
        logger.error("❌ Database connection failed:", error);
        process.exit(1);
    }
};

startServer();

export default app;

