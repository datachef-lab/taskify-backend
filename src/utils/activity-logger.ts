import { Request, Response, NextFunction } from "express";
import { UserDto } from "../types/user.type";
import { activityTypeEnum, entityTypeEnum } from "../modules/analytics/models/activityLog.model";
import { logger } from "./logger";
import {
    createActivityLog,
    getActivityLogsByUser,
    getRecentActivityLogs,
} from "../modules/analytics/services/logging.service";

// Type for activity log details
type ActivityDetails = Record<string, unknown>;

type Activity =
    | "LOGIN"
    | "LOGOUT"
    | "CREATE"
    | "UPDATE"
    | "DELETE"
    | "VIEW"
    | "EXPORT"
    | "IMPORT"
    | "ASSIGN"
    | "COMPLETE"
    | "APPROVE"
    | "REJECT"
    | "COMMENT"
    | "NOTIFICATION"
    | "ERROR"
    | "OTHER";

type Entity =
    | "NOTIFICATION"
    | "OTHER"
    | "TASK"
    | "FUNCTION"
    | "FIELD"
    | "INPUT"
    | "USER"
    | "CUSTOMER"
    | "REPORT"
    | "SETTING";

/**
 * Logs user activity to the database
 *
 * @param userId - The ID of the user performing the action
 * @param activityType - Type of activity (CREATE, UPDATE, DELETE, etc.)
 * @param entityType - Type of entity being acted upon (USER, TASK, PROJECT, etc.)
 * @param entityId - ID of the entity (optional)
 * @param description - Description of the activity
 * @param details - Additional details (optional)
 * @param ipAddress - IP address of the user (optional)
 * @param statusCode - HTTP status code of the response (optional)
 * @param tags - Tags for categorizing activities (optional)
 *
 * @returns Promise that resolves when the activity is logged
 */
export async function logUserActivity(
    userId: number,
    activityType: string,
    entityType: string,
    entityId: number | undefined,
    description: string,
    details?: ActivityDetails,
    ipAddress?: string,
    statusCode?: number,
    tags?: string[]
): Promise<void> {
    try {
        // Validate activityType against enum
        const validActivityTypes = Object.values(activityTypeEnum.enumValues);
        // Type assertion for string comparison
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!validActivityTypes.includes(activityType as any)) {
            logger.warn(`Invalid activity type: ${activityType}, defaulting to OTHER`);
            activityType = "OTHER";
        }

        // Validate entityType against enum
        const validEntityTypes = Object.values(entityTypeEnum.enumValues);
        // Type assertion for string comparison
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!validEntityTypes.includes(entityType as any)) {
            logger.warn(`Invalid entity type: ${entityType}, defaulting to OTHER`);
            entityType = "OTHER";
        }

        // Log the activity
        await createActivityLog({
            userId,
            activityType: activityType as Activity,
            entityType: entityType as Entity,
            entityId,
            description,
            details,
            ipAddress,
            statusCode,
            tags,
        });
    } catch (error) {
        // Never throw from the activity logger - just log the error
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(
            `Failed to log user activity: ${errorMessage}`,
            error instanceof Error ? error : new Error(errorMessage)
        );
    }
}

// Type for middleware options
interface LogActivityOptions {
    entityType: string;
    getEntityId?: (req: Request) => number | undefined;
    getActivityType?: (req: Request) => string;
    getDescription?: (req: Request) => string;
    getDetails?: (req: Request) => ActivityDetails | undefined;
    getTags?: (req: Request) => string[] | undefined;
}

/**
 * Middleware to log user activity
 *
 * This middleware captures standard REST operations and logs them automatically
 * when used in a route.
 *
 * @param options - Configuration options for the middleware
 * @returns Express middleware function
 */
export function logActivityMiddleware(options: LogActivityOptions) {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Keep track of whether logging happened
        let loggingDone = false;

        // Create a function to handle the logging
        const performLogging = (): void => {
            // Skip if already logged or no authenticated user
            // Use type assertion to tell TypeScript that req has a user property
            const userId = (req as Request & { user?: UserDto }).user?.id;

            if (loggingDone || !userId) {
                return;
            }

            loggingDone = true;

            // Determine activity type based on HTTP method or custom function
            const activityType = options.getActivityType
                ? options.getActivityType(req)
                : getActivityTypeFromMethod(req.method);

            // Get entity ID from request or custom function
            const entityId = options.getEntityId ? options.getEntityId(req) : getEntityIdFromRequest(req);

            // Generate description or use custom function
            const description = options.getDescription
                ? options.getDescription(req)
                : generateDescription(req, options.entityType, activityType);

            // Get additional details if provided
            const details = options.getDetails ? options.getDetails(req) : undefined;

            // Get tags if provided
            const tags = options.getTags ? options.getTags(req) : undefined;

            // Log the activity
            logUserActivity(
                userId!, // We've already checked userId exists above in the if condition
                activityType,
                options.entityType,
                entityId,
                description,
                details,
                req.ip,
                res.statusCode,
                tags
            ).catch((error) => {
                logger.error(
                    `Error in activity logging middleware: ${error instanceof Error ? error.message : String(error)}`,
                    error instanceof Error ? error : new Error(String(error))
                );
            });
        };

        // Listen for response finish event to log activity
        res.on("finish", performLogging);

        // Also capture on close event in case finish is not called
        res.on("close", performLogging);

        next();
    };
}

/**
 * Utility function to get activity type from HTTP method
 */
function getActivityTypeFromMethod(method: string): string {
    switch (method.toUpperCase()) {
        case "GET":
            return "VIEW";
        case "POST":
            return "CREATE";
        case "PUT":
        case "PATCH":
            return "UPDATE";
        case "DELETE":
            return "DELETE";
        default:
            return "OTHER";
    }
}

/**
 * Utility function to extract entity ID from request
 */
function getEntityIdFromRequest(req: Request): number | undefined {
    // Try to get ID from params
    if (req.params.id) {
        const id = parseInt(req.params.id);
        if (!isNaN(id)) return id;
    }

    // Try other common param patterns
    for (const key of Object.keys(req.params)) {
        if (key.endsWith("Id")) {
            const id = parseInt(req.params[key]);
            if (!isNaN(id)) return id;
        }
    }

    // If creating a new entity (POST), try to get ID from response body
    if (req.method === "POST" && req.body?.id) {
        const id = parseInt(req.body.id);
        if (!isNaN(id)) return id;
    }

    return undefined;
}

/**
 * Utility function to generate a description based on the request
 */
function generateDescription(req: Request, entityType: string, activityType: string): string {
    const entityName = entityType.toLowerCase();
    let action = "";

    switch (activityType) {
        case "CREATE":
            action = `Created a new ${entityName}`;
            break;
        case "VIEW":
            action = `Viewed ${entityName}`;
            if (req.params.id) action += ` #${req.params.id}`;
            break;
        case "UPDATE":
            action = `Updated ${entityName}`;
            if (req.params.id) action += ` #${req.params.id}`;
            break;
        case "DELETE":
            action = `Deleted ${entityName}`;
            if (req.params.id) action += ` #${req.params.id}`;
            break;
        default:
            action = `Performed action on ${entityName}`;
            if (req.params.id) action += ` #${req.params.id}`;
    }

    return action;
}

/**
 * Get activity logs by user ID
 *
 * @param userId The user ID to filter by
 * @returns Array of activity logs for the user
 */
export const getActivityLogsForUser = async (userId: number) => {
    try {
        return await getActivityLogsByUser(userId);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(
            `Failed to get user activity logs: ${errorMessage}`,
            error instanceof Error ? error : new Error(errorMessage)
        );
        throw error;
    }
};

/**
 * Get recent activity logs
 *
 * @param limit The maximum number of logs to return
 * @returns Array of recent activity logs
 */
export const getRecentActivities = async (limit = 50) => {
    try {
        return await getRecentActivityLogs(limit);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(
            `Failed to get recent activity logs: ${errorMessage}`,
            error instanceof Error ? error : new Error(errorMessage)
        );
        throw error;
    }
};

/**
 * Example usage in a controller:
 *
 * // Inside a controller function:
 * async function createTask(req, res) {
 *     try {
 *         const userId = req.user.id;
 *
 *         // Create task logic
 *         const task = await createTaskInDb(req.body);
 *
 *         // Log the activity
 *         await logUserActivity(
 *             userId,
 *             'CREATE',
 *             'TASK',
 *             task.id,
 *             `User created task: ${task.name}`,
 *             { taskData: req.body },
 *             req.ip
 *         );
 *
 *         return res.status(201).json(task);
 *     } catch (error) {
 *         // Error handling
 *     }
 * }
 */
