import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { recordMetric } from "../modules/analytics/services/performanceMetrics.service";
import { UserDto } from "../types/user.type";

// Type definition for authenticated request
interface AuthenticatedRequest extends Request {
    user?: UserDto;
}

// Paths to exclude from performance tracking
const EXCLUDE_PATHS = ["/health", "/metrics", "/api/health", "/assets/", "/static/"];

/**
 * Middleware to track API performance metrics
 *
 * This middleware measures response times for API requests and logs them
 * for performance monitoring and analysis. It also stores metrics in the database
 * through the performanceMetrics service.
 *
 * @returns Express middleware function
 */
export function trackPerformance() {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        // Skip tracking for excluded paths
        const path = req.path;
        if (EXCLUDE_PATHS.some((excludePath) => path.startsWith(excludePath))) {
            return next();
        }

        // Record start time
        const startTime = process.hrtime();

        // Keep track of whether metrics were recorded
        let metricsRecorded = false;

        // Store the original end function
        const originalEnd = res.end;

        // Override res.end to calculate and log response time
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        res.end = function (...args: any[]) {
            // Skip if already recorded
            if (metricsRecorded) {
                // Call the original end function and return its result
                return originalEnd.apply(res, [args[0], args[1] as BufferEncoding, args[2] as () => void]);
            }

            metricsRecorded = true;

            // Calculate duration
            const hrTime = process.hrtime(startTime);
            const durationMs = hrTime[0] * 1000 + hrTime[1] / 1000000;

            const operation = `${req.method} ${req.path}`;

            try {
                // Add custom header with response time
                if (!res.headersSent) {
                    res.setHeader("X-Response-Time", `${durationMs.toFixed(2)}ms`);
                }

                // Log performance metric
                logger.info(
                    `Performance: ${operation} completed in ${durationMs.toFixed(2)}ms with status ${res.statusCode}`
                );

                // Store metric in database asynchronously - we don't await this to avoid delaying the response
                recordMetric({
                    operation,
                    metricType: "API_RESPONSE_TIME" as const,
                    durationMs,
                    httpMethod: req.method,
                    statusCode: res.statusCode,
                    userId: req.user?.id,
                    requestDetails: {
                        path: req.path,
                        query: req.query,
                        referrer: req.headers.referer || req.headers.referrer,
                    },
                    ipAddress: req.ip,
                    userAgent: req.headers["user-agent"],
                }).catch((error) => {
                    logger.error(
                        "Failed to store performance metric",
                        error instanceof Error ? error : new Error(String(error))
                    );
                });
            } catch (error) {
                // Ensure metric recording errors don't break the application
                logger.error(
                    "Failed to record performance metric",
                    error instanceof Error ? error : new Error(String(error))
                );
            }

            // Call the original end function and return its result
            return originalEnd.apply(res, [args[0], args[1] as BufferEncoding, args[2] as () => void]);
        };

        next();
    };
}

/**
 * Tracks database operation performance
 *
 * @param operation The database operation name
 * @param entityType The entity type (table name)
 * @param callback The database operation to track
 * @param entityId Optional entity ID for the operation
 * @param userId Optional user ID associated with the operation
 */
export const trackDbOperation = async <T>(
    operation: string,
    entityType: string,
    callback: () => Promise<T>,
    entityId?: number,
    userId?: number
): Promise<T> => {
    const startTime = process.hrtime();

    try {
        // Execute the database operation
        const result = await callback();

        // Calculate duration
        const diff = process.hrtime(startTime);
        const durationMs = diff[0] * 1e3 + diff[1] * 1e-6;

        // Construct entity info for logging
        const entityInfo = entityId ? `${entityType} #${entityId}` : entityType;
        const userInfo = userId ? ` by user #${userId}` : "";

        // Log the performance metric
        logger.info(`DB: ${operation} on ${entityInfo}${userInfo} completed in ${durationMs.toFixed(2)}ms`);

        // Store metric in database asynchronously
        recordMetric({
            operation: `DB_${operation.toUpperCase()}`,
            metricType: "DATABASE_QUERY_TIME" as const,
            durationMs,
            entityType,
            entityId,
            userId,
            metadata: {
                entityInfo,
                userInfo,
                operation,
            },
        }).catch((error) => {
            logger.error(
                "Failed to store DB performance metric",
                error instanceof Error ? error : new Error(String(error))
            );
        });

        return result;
    } catch (error) {
        // Calculate duration even for failed operations
        const diff = process.hrtime(startTime);
        const durationMs = diff[0] * 1e3 + diff[1] * 1e-6;

        // Construct entity info for logging
        const entityInfo = entityId ? `${entityType} #${entityId}` : entityType;
        const userInfo = userId ? ` by user #${userId}` : "";

        // Log the performance metric for failed operation
        logger.error(
            `DB operation failed: ${operation} on ${entityInfo}${userInfo} after ${durationMs.toFixed(2)}ms`,
            error instanceof Error ? error : new Error(String(error))
        );

        // Store error metric asynchronously
        recordMetric({
            operation: `DB_${operation.toUpperCase()}`,
            metricType: "ERROR_COUNT" as const,
            durationMs,
            entityType,
            entityId,
            userId,
            statusCode: 500, // Using 500 as a convention for DB errors
            metadata: {
                entityInfo,
                userInfo,
                operation,
                error: error instanceof Error ? error.message : String(error),
            },
        }).catch((err) => {
            logger.error("Failed to store DB error metric", err instanceof Error ? err : new Error(String(err)));
        });

        // Re-throw the original error
        throw error;
    }
};
