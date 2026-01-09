import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "dotenv/config";

import { config } from "./config";
import { mainRouter } from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/loginLimitations";
import logger from "./utils/logger";
import prisma from './utils/prisma';

const app: Express = express();

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));
app.use(cors());

app.use(morgan("combined", {
    stream: {
        write: (message: string) => logger.info(message.trim())
    }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(config.prefix, apiLimiter);

app.get("/", (_req: Request, res: Response) => {
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

        await prisma.$connect();
        logger.info(' Database connected sucessfully');

        app.listen(config.port, () => {
            logger.info(`Server running on port ${config.port}`);

        });
    } catch (error) {
        logger.error("Server failed to start:", error);
        process.exit(1);
    }
};

startServer();

export default app;

