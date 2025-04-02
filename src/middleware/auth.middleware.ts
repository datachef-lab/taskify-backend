import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.utils";
import { ApiResponse } from "../utils/api-response";

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return ApiResponse.unauthorized(res, "Access token is missing or invalid");
    }

    const token = authHeader.split(" ")[1];
    try {
        const payload = verifyAccessToken(token);
        req.user = payload as { id: string; name: string; email: string }; // Attach the payload to the request object
        next();
    } catch {
        return ApiResponse.unauthorized(res, "Access token is invalid or expired");
    }
};
