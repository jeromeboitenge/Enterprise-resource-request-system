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
import logger from "./utils/logger";

// Validate environment variables before starting
try {
    validateEnv();
} catch (error) {
    console.error(error);
    process.exit(1);
}

const app: Express = express();

// Security middleware - Helmet with enhanced configuration
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// CORS - Use whitelist from environment
const corsOrigins = process.env.CORS_ORIGIN?.split(',') || ['*'];
app.use(
    cors({
        origin: corsOrigins.includes('*') ? '*' : corsOrigins,
        credentials: true,
    })
);

// Logging - Use Morgan with Winston
app.use(morgan("combined", {
    stream: {
        write: (message: string) => logger.info(message.trim())
    }
}));

// Body parsers with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization - Prevent NoSQL injection and XSS
app.use(sanitizeInput);
app.use(customSanitize);

// Rate limiting for API endpoints
app.use(config.prefix, apiLimiter);

// Health check
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Enterprise Resource Request System API",
        version: "1.0.0",
        status: "running",
    });
});

// Routes
app.use(config.prefix, mainRouter);

// 404
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ✅ Start server only after DB connection
const startServer = async () => {
    try {
        await databaseConnection();
        app.listen(config.port, () => {
            logger.info(`🚀 Server running on port ${config.port}`);
            logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`🔒 CORS Origins: ${corsOrigins.join(', ')}`);
        });
    } catch (error) {
        logger.error("❌ Database connection failed:", error);
        process.exit(1);
    }
};

startServer();

export default app;

