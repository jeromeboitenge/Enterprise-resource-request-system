import dotenv from "dotenv"
import mongoose from "mongoose"
dotenv.config();
export const databaseConnection = async () => {
    var db_url: NonNullable<string> = process.env.DATABASE_URL as string
    const db_username: NonNullable<string> = process.env.DATABASE_USERNAME as string
    const db_password: NonNullable<string> = process.env.PASSWORD as string


    try {
        db_url = db_url.replace("<db_username>", db_username).replace("<db_password>", db_password);
        await mongoose.connect(db_url, {}).then((value) => {
            console.log('Our Database is Running ')

        }).catch((err) => console.log(err))
    }
    catch (error) {
        return error
    }
}
