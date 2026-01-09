import dotenv from "dotenv";
dotenv.config();

const getDatabaseUrl = (): string => {
    const env = process.env.NODE_ENV || "development";

    let dbUrl: string | undefined;

    switch (env.toLowerCase()) {
        case "production":
            dbUrl = process.env.DB_PROD_URL;
            break;
        case "test":
            dbUrl = process.env.DB_TEST_URL;
            break;
        case "development":
        default:
            dbUrl = process.env.DB_DEV_URL;
            break;
    }

    // Fallback to DATABASE_URL if environment-specific URL is not set
    if (!dbUrl) {
        dbUrl = process.env.DATABASE_URL;
    }

    if (!dbUrl) {
        throw new Error(
            `Database URL not found. Please set DB_${env.toUpperCase()}_URL or DATABASE_URL in your .env file`
        );
    }

    return dbUrl;
};

export const config = {
    port: parseInt(process.env.PORT || "3333", 10),
    prefix: process.env.PREFIX || process.env.API_PREFIX || "/api/v1",
    nodeEnv: process.env.NODE_ENV || "development",
    jwtSecret: process.env.JWT_SECRET || "",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
    corsOrigin: process.env.CORS_ORIGIN || "*",


    database: {
        url: getDatabaseUrl(),
    },

    // Email configuration
    email: {
        host: process.env.EMAIL_HOST || "",
        port: parseInt(process.env.EMAIL_PORT || "587", 10),
        user: process.env.EMAIL_USER || "",
        password: process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || "",
        from: process.env.EMAIL_FROM || "noreply@example.com",
    },
};
