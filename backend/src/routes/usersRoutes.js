import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { getUser, getUsers } from "../controllers/usersController.js";

export const usersRouter = Router();

usersRouter.get("/", asyncHandler(getUsers));
usersRouter.get("/:id", asyncHandler(getUser));
