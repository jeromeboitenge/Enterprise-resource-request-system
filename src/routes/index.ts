import express, { Router } from "express";
import authRoutes from "../auth/auth.routes";
import departmentRoutes from "./department.routes";
import requestRoutes from "./request.routes";
import approvalRoutes from "./approval.routes";
import paymentRoutes from "./payment.routes";
import notificationRoutes from "./notification.routes";
import userRoutes from "./user.routes";

const routes: Router[] = [
    authRoutes,
    departmentRoutes,
    requestRoutes,
    approvalRoutes,
    paymentRoutes
];

const mainRouter = express.Router();

mainRouter.use('/auth', authRoutes)
mainRouter.use('/departments', departmentRoutes)
mainRouter.use('/requests', requestRoutes);
mainRouter.use('/approvals', approvalRoutes);
mainRouter.use('/payments', paymentRoutes);
mainRouter.use('/notifications', notificationRoutes);
mainRouter.use('/users', userRoutes);

export { mainRouter };