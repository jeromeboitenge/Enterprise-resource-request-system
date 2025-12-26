import express, { Router } from "express";
import authRoutes from "./auth.routes";
import departmentRoutes from "./department.routes";
import requestRoutes from "./request.routes";
import approvalRoutes from "./approval.routes";
import paymentRoutes from "./payment.routes";

const routes: Router[] = [
    authRoutes,
    departmentRoutes,
    requestRoutes,
    approvalRoutes,
    paymentRoutes
];

const mainRouter = express.Router();

// Mount auth routes
mainRouter.use('/auth', authRoutes);

// Mount other routes
mainRouter.use('/departments', departmentRoutes);
mainRouter.use('/requests', requestRoutes);
mainRouter.use('/approvals', approvalRoutes);
mainRouter.use('/payments', paymentRoutes);

export { mainRouter };