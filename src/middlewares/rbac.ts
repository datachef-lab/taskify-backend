import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

/**
 * Role-based access control middleware
 * Checks if the authenticated user has the required role(s)
 *
 * @param allowedRoles - Array of roles that are allowed to access the route
 */
export const authorize = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const userRole = req.user?.role;

            if (!userRole) {
                res.status(401).json({
                    success: false,
                    message: "Authentication required. Please log in.",
                });
                return;
            }

            if (!allowedRoles.includes(userRole)) {
                res.status(403).json({
                    success: false,
                    message: "You don't have permission to access this resource",
                });
                return;
            }

            next();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(
                `Authorization error: ${errorMessage}`,
                error instanceof Error ? error : new Error(errorMessage),
                "RBACMiddleware"
            );

            res.status(403).json({
                success: false,
                message: "Authorization failed",
            });
        }
    };
};
