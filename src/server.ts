
import express, { Express, Request, Response } from "express";
import cors from "cors";
import { config as dotenv } from "dotenv";
dotenv();
import { config, databaseConnection } from "./config";
import { mainRouter } from "./routes";


const app: Express = express();
app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("Welcome to Solvit Africa cohort 2 node js");
});
app.use(config.prefix, mainRouter)
app.use((req: Request, res: Response) => {
    res.status(404).json({
        message: "invalid path",
    });
});
databaseConnection().then(() => {
    app.listen(config.port, () => console.log(`server is running  on port ${config.port}`));

})
export default app;