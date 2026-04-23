import { Router } from "express";
import { dashboardRouter } from "./dashboardRoutes.js";
import { usersRouter } from "./usersRoutes.js";
import { patientsRouter } from "./patientsRoutes.js";
import { servicesRouter } from "./servicesRoutes.js";
import { appointmentsRouter } from "./appointmentsRoutes.js";
import { paymentsRouter } from "./paymentsRoutes.js";
import { expensesRouter } from "./expensesRoutes.js";
import { billingRouter } from "./billingRoutes.js";

export const router = Router();

router.use("/dashboard", dashboardRouter);
router.use("/users", usersRouter);
router.use("/patients", patientsRouter);
router.use("/services", servicesRouter);
router.use("/appointments", appointmentsRouter);
router.use("/payments", paymentsRouter);
router.use("/expenses", expensesRouter);
router.use("/billing", billingRouter);
