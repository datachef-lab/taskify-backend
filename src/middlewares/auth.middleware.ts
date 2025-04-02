import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.utils";
import { ApiResponse } from "../utils/api-response";

/**
 * Middleware to authenticate requests using a JWT access token.
 * Verifies the token and attaches the decoded payload to the `req.user` object.
 * If the token is invalid or missing, it responds with a 401 Unauthorized error.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    // Check if the Authorization header is present and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return ApiResponse.unauthorized(res, "Access token is missing or invalid");
    }

    const token = authHeader.split(" ")[1];
    try {
        // Verify the token and attach the payload to req.user
        const payload = verifyAccessToken(token);
        req.user = payload as { id: string; name: string; email: string }; // Attach the payload to the request object
        next();
    } catch {
        return ApiResponse.unauthorized(res, "Access token is invalid or expired");
    }
};
