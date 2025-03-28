import { Request, Response, NextFunction } from "express";
import { LoggingService } from "../modules/analytics/services/logging.service";
import { logger } from "../utils/logger";

/**
 * Interface for user data stored in request
 */
interface AuthenticatedUser {
    id: number;
    email: string;
    role: string;
}

/**
 * Interface for request with user data
 */
interface AuthenticatedRequest extends Request {
    user?: AuthenticatedUser;
}

/**
 * Middleware to log user activities
 *
 * This middleware captures and logs user actions for analytics
 * and auditing purposes
 */
export const logUserActivity = (actionType: string) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        // Store original send method
        const originalSend = res.send;

        // Override send method to capture response
        res.send = function (this: Response, body?: unknown): Response {
            const userId = req.user?.id;

            // Only log activities if we have a user ID
            if (userId) {
                // Extract only necessary information from request
                const requestData = {
                    method: req.method,
                    path: req.path,
                    query: req.query,
                    params: req.params,
                    // Sanitize or limit body data
                    body: sanitizeRequestBody(req.body),
                };

                try {
                    // Log the activity asynchronously
                    LoggingService.createActivityLog({
                        activityType: actionType,
                        entityType: getResourceTypeFromPath(req.path),
                        entityId: getResourceIdFromRequest(req) || 0,
                        userId,
                        description: `User performed ${actionType} on ${getResourceTypeFromPath(req.path)}`,
                        ipAddress: req.ip,
                        details: {
                            request: requestData,
                            statusCode: res.statusCode,
                            userAgent: req.get("user-agent"),
                        },
                        statusCode: res.statusCode,
                    }).catch((error) => {
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        logger.error(
                            `Failed to log activity: ${errorMessage}`,
                            error instanceof Error ? error : new Error(errorMessage),
                            "ActivityLoggingMiddleware"
                        );
                    });
                } catch (error) {
                    // Just log the error but don't disrupt the request flow
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    logger.error(
                        `Error in activity logging middleware: ${errorMessage}`,
                        error instanceof Error ? error : new Error(errorMessage),
                        "ActivityLoggingMiddleware"
                    );
                }
            }

            // Call original send method
            return originalSend.call(this, body);
        };

        next();
    };
};

/**
 * Extract resource type from path
 * Example: /api/users/123 -> users
 */
function getResourceTypeFromPath(path: string): string {
    // Split the path and get the resource type (typically the second segment in RESTful APIs)
    const segments = path.split("/").filter((segment) => segment.length > 0);
    return segments.length > 0 ? segments[segments.length > 1 ? 1 : 0] : "unknown";
}

/**
 * Extract resource ID from request
 * Tries to find an ID from URL params or request body
 */
function getResourceIdFromRequest(req: Request): number | undefined {
    // First check URL params (e.g. /users/:id)
    if (req.params.id) {
        const id = parseInt(req.params.id);
        if (!isNaN(id)) return id;
    }

    // Then check other common ID param names
    const commonIdParams = ["userId", "projectId", "taskId", "resourceId"];
    for (const paramName of commonIdParams) {
        if (req.params[paramName]) {
            const id = parseInt(req.params[paramName]);
            if (!isNaN(id)) return id;
        }
    }

    // Check request body for IDs
    if (req.body) {
        if (req.body.id && typeof req.body.id === "number") {
            return req.body.id;
        }

        // Check for common ID field names in the body
        for (const fieldName of commonIdParams) {
            if (req.body[fieldName] && typeof req.body[fieldName] === "number") {
                return req.body[fieldName];
            }
        }
    }

    return undefined;
}

/**
 * Sanitize request body for logging
 * Removes sensitive information and limits size
 */
function sanitizeRequestBody(body: unknown): unknown {
    if (!body) return undefined;

    try {
        // Check if body is an object
        if (typeof body !== "object" || body === null) return body;

        // Clone body to avoid modifying original
        const sanitized = { ...(body as Record<string, unknown>) };

        // Remove sensitive fields
        const sensitiveFields = ["password", "token", "secret", "apiKey"];
        for (const field of sensitiveFields) {
            if (field in sanitized) {
                sanitized[field] = "[REDACTED]";
            }
        }

        // Convert to string and limit size if too large
        const jsonString = JSON.stringify(sanitized);
        const maxLength = 1000; // Max length to store

        if (jsonString.length <= maxLength) {
            return sanitized;
        } else {
            // Return truncated version
            return {
                _truncated: true,
                _originalSize: jsonString.length,
                summary: JSON.parse(jsonString.substring(0, maxLength) + "..."),
            };
        }
    } catch (error) {
        console.log(error);
        // If any error in sanitization, return simple object
        return { _error: "Could not sanitize request body" };
    }
}
