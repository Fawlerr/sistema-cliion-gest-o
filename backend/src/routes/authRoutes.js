import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { getMe, postLogin, postRegister } from "../controllers/authController.js";
import { authenticate, authenticateOptional } from "../middleware/authMiddleware.js";

export const authRouter = Router();

authRouter.post("/login", asyncHandler(postLogin));
authRouter.post("/register", authenticateOptional, asyncHandler(postRegister));
authRouter.get("/me", authenticate, asyncHandler(getMe));
