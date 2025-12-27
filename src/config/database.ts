import mongoose from "mongoose";

export const databaseConnection = async (): Promise<void> => {
    try {
        let dbUrl = process.env.DB_URL as string;
        const dbUsername = process.env.DB_USERNAME as string;
        const dbPassword = process.env.DB_PASSWORD as string;

        if (!dbUrl || !dbUsername || !dbPassword) {
            throw new Error("❌ Missing database environment variables");
        }

        dbUrl = dbUrl
            .replace("<db_username>", dbUsername)
            .replace("<db_password>", dbPassword);

        // Disable mongoose buffering (BEST PRACTICE)
        mongoose.set("bufferCommands", false);

        await mongoose.connect(dbUrl);

        console.log("✅ MongoDB connected successfully");
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error);
        throw error; // VERY IMPORTANT
    }
};
