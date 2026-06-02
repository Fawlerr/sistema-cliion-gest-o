import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { getUser, getUsers } from "../controllers/usersController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

export const usersRouter = Router();

usersRouter.use(authenticate, authorizeRoles([1, 2]));
usersRouter.get("/", asyncHandler(getUsers));
usersRouter.get("/:id", asyncHandler(getUser));
