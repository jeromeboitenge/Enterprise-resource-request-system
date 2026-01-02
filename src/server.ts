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

/**
 * Validate environment variables before starting the server
 * Ensures all required configuration is present and valid
 * Exits with error code 1 if validation fails
 */
try {
    validateEnv();
} catch (error) {
    console.error('❌ Environment validation failed:', error);
    process.exit(1);
}

const app: Express = express();

// ============================================
// Request Tracking Middleware
// ============================================

/**
 * Add unique request ID to all requests
 * The ID is available as req.id and in the X-Request-ID response header
 * Useful for request tracing and log correlation
 */
app.use(requestIdMiddleware);

// ============================================
// Security Middleware
// ============================================
/**
 * Helmet - Security headers middleware
 * 
 * Configurations:
 * - Content Security Policy (CSP): Restricts resource loading to prevent XSS
 * - HSTS: Forces HTTPS connections for 1 year
 * - Other headers: X-Frame-Options, X-Content-Type-Options, etc.
 */
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

// ============================================
// CORS Configuration
// ============================================

/**
 * CORS - Cross-Origin Resource Sharing
 * 
 * Allows requests from specified origins (configured via CORS_ORIGIN env variable)
 * In development: Use '*' to allow all origins
 * In production: Specify exact origins (e.g., 'https://yourdomain.com')
 */
const corsOrigins = process.env.CORS_ORIGIN?.split(',') || ['*'];
app.use(
    cors({
        origin: corsOrigins.includes('*') ? '*' : corsOrigins,
        credentials: true,  // Allow cookies and authorization headers
    })
);

// ============================================
// Logging Middleware
// ============================================

/**
 * Morgan - HTTP request logger
 * Logs all HTTP requests using Winston logger
 * Format: 'combined' (Apache combined log format)
 */
app.use(morgan("combined", {
    stream: {
        write: (message: string) => logger.info(message.trim())
    }
}));

// ============================================
// Body Parsing Middleware
// ============================================

/**
 * Express body parsers with size limits
 * Limits prevent denial-of-service attacks via large payloads
 * Max size: 10MB for both JSON and URL-encoded bodies
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// Input Sanitization Middleware
// ============================================

/**
 * Input sanitization to prevent injection attacks
 * - mongoSanitize: Prevents NoSQL injection by removing $ and . from user input
 * - customSanitize: Removes XSS patterns (script tags, event handlers)
 */
app.use(sanitizeInput);
app.use(customSanitize);

// ============================================
// Rate Limiting
// ============================================

/**
 * Rate limiting for API endpoints
 * Prevents abuse by limiting requests per IP address
 * Limit: 100 requests per 15 minutes per IP
 */
app.use(config.prefix, apiLimiter);

// ============================================
// Routes
// ============================================

/**
 * Health check endpoint
 * Returns API status and version information
 */
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Enterprise Resource Request System API",
        version: "1.0.0",
        status: "running",
    });
});

/**
 * API routes
 * All application routes are mounted under the configured prefix (e.g., /api/v1)
 */
app.use(config.prefix, mainRouter);

// ============================================
// Error Handling Middleware
// ============================================

/**
 * 404 handler for undefined routes
 * Must be placed after all valid routes
 */
app.use(notFoundHandler);

/**
 * Global error handler
 * Catches all errors and sends consistent error responses
 * Must be the last middleware
 */
app.use(errorHandler);

// ============================================
// Server Startup
// ============================================

/**
 * Start the Express server
 * 
 * Process:
 * 1. Connect to MongoDB database
 * 2. Start HTTP server on configured port
 * 3. Log startup information
 * 
 * If database connection fails, the process exits with code 1
 */
const startServer = async () => {
    try {
        // Connect to database first
        await databaseConnection();

        // Start HTTP server
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

