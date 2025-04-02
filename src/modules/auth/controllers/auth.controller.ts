import { Request, Response } from "express";
import { authenticateUser, refreshAccessToken } from "../services/auth.service";
import { ApiResponse } from "../../../utils/api-response";
import { createUserService } from "../../user/services/user.service";
import { generateAccessToken, generateRefreshToken } from "../../../utils/jwt.utils";

/**
 * Controller to handle user sign-in.
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const signIn = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return ApiResponse.badRequest(res, "Email and password are required");
        }

        // Authenticate the user and generate tokens
        const { accessToken, refreshToken } = await authenticateUser(email, password);

        // Set the refresh token as an HTTP-only cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Return the access token
        ApiResponse.success(res, { data: { accessToken }, message: "Sign-in successful" });
    } catch (error) {
        ApiResponse.error(res, {
            message: error instanceof Error ? error.message : "An error occurred during sign-in",
        });
    }
};

/**
 * Controller to handle token refresh.
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            return ApiResponse.badRequest(res, "Refresh token is missing");
        }

        const newAccessToken = await refreshAccessToken(refreshToken);
        ApiResponse.success(res, { data: { accessToken: newAccessToken } });
    } catch (error) {
        ApiResponse.error(res, {
            message: error instanceof Error ? error.message : "An error occurred during token refresh",
        });
    }
};

/**
 * Controller to handle user signup.
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, phone } = req.body;

        // Validate input
        if (!name || !email || !password || !phone) {
            return ApiResponse.badRequest(res, "All fields (name, email, password, phone) are required");
        }

        // Check if the user already exists
        const existingUser = await createUserService({ name, email, password, phone }, true); // Pass `true` to check for existing users
        if (!existingUser) {
            return ApiResponse.badRequest(res, "User already exists with this email.");
        }

        // Generate tokens
        const accessToken = generateAccessToken({ id: existingUser.id, email: existingUser.email });
        const refreshToken = generateRefreshToken({ id: existingUser.id, email: existingUser.email });

        // Set the refresh token as an HTTP-only cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Return the access token
        ApiResponse.success(res, { data: { accessToken }, message: "Signup successful" });
    } catch (error) {
        ApiResponse.error(res, {
            message: error instanceof Error ? error.message : "An error occurred during sign-in",
        });
    }
};
