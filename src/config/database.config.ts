import dotenv from "dotenv";
dotenv.config();

const prefixConfig = () => {
    const env = process.env.NODE_ENV || "development";

    switch (env) {
        case "development":
            return "DEV";
        case "production":
            return "PROD";
        case "test":
            return "TEST";
        default:
            return "DEV";
    }
};

const databaseConnection = () => {
    const prefix = prefixConfig();
    const database = process.env[`DB_${prefix}_URL`];

    if (!database) {
        throw new Error(`Missing DB_${prefix}_URL in .env`);
    }

    // Safety guard
    if (
        process.env.NODE_ENV === "test" &&
        database.includes("proud-union")
    ) {
        throw new Error(" Test environment is pointing to DEV/PROD database");
    }

    return { database };
};

export default databaseConnection;
