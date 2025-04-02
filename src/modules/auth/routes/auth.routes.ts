import { Router } from "express";
import { refreshToken, signIn, signup } from "../controllers/auth.controller";

const authRouter = Router();

/**
 * @route POST /api/auth/signin
 * @description Sign in a user and return tokens.
 * @access Public
 */
authRouter.post("/signin", signIn);

/**
 * @route POST /api/auth/signup
 * @description Register a new user and return tokens.
 * @access Public
 */
authRouter.post("/signup", signup);

/**
 * @route POST /api/auth/refresh
 * @description Refresh the access token using a refresh token.
 * @access Public
 */
authRouter.post("/refresh", refreshToken);

export default authRouter;
