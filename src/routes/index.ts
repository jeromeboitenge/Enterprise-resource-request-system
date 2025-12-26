import express, { Router } from "express";
import { studentRouter } from "./student";
import { attendanceRouter } from "./attendance.router";
import { userRoute } from "./users.Routes";
import { authRoute } from "./auth.routes";


const routes: Router[] = [
    studentRouter,
    attendanceRouter,
    userRoute,
    authRoute

];

const mainRouter = express();

routes.forEach((router) => {
    mainRouter.use(router);
});

export { mainRouter };