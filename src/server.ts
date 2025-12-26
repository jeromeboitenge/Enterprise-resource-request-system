import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config as dotenv } from "dotenv";
dotenv();
import { config, databaseConnection } from "./config";
import { mainRouter } from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";


const app: Express = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

// Request logging
app.use(morgan('dev'));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
    res.json({
        success: true,
        message: "Enterprise Resource Request System API",
        version: "1.0.0",
        status: "running"
    });
});

// API routes
app.use(config.prefix, mainRouter);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Database connection and server start
databaseConnection().then(() => {
    app.listen(config.port, () => console.log(`🚀 Server is running on port ${config.port}`));
}).catch((error) => {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
});

export default app;