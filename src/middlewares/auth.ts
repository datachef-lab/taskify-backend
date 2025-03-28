import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger";

interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: string;
        [key: string]: any;
    };
}

/**
 * Middleware to authenticate JWT tokens
 *
 * This middleware verifies the JWT token in the Authorization header and
 * adds the decoded user information to the request object.
 */
export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
    // Get the auth header value
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN format

    if (!token) {
        res.status(401).json({
            success: false,
            message: "Access denied. No token provided.",
        });
        return;
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");

        // Add user info to request
        (req as AuthenticatedRequest).user = decoded as { id: number; email: string; role: string; [key: string]: any };

        next();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(
            `JWT authentication error: ${errorMessage}`,
            error instanceof Error ? error : new Error(errorMessage),
            "AuthMiddleware"
        );

        res.status(403).json({
            success: false,
            message: "Invalid or expired token.",
        });
    }
}

/**
 * Middleware to check user roles
 *
 * This middleware checks if the authenticated user has one of the required roles.
 *
 * @param allowedRoles - Array of roles that are allowed to access the resource
 */
export function checkRole(allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = (req as AuthenticatedRequest).user;

        // If user or role is not defined, deny access
        if (!user || !user.role) {
            res.status(403).json({
                success: false,
                message: "Access denied. User role not found.",
            });
            return;
        }

        // Check if user role is in allowed roles
        if (allowedRoles.includes(user.role)) {
            next();
        } else {
            res.status(403).json({
                success: false,
                message: "Access denied. Insufficient permissions.",
            });
        }
    };
}
