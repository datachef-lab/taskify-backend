import { Request, Response } from "express";
import { logger } from "../../../utils/logger";
import { JobScheduler } from "../../../jobs/scheduler";
import {
    getActivityLogsByEntityType,
    getActivityLogsByType,
    getActivityLogsByUser,
    getRecentActivityLogs,
} from "../services/logging.service";
import {
    getLatestStatistics,
    getStatisticsByDateRange,
    getStatisticsByTimePeriod,
    getStatisticsByType,
} from "../services/statistics.service";
import {
    calculateAverageDuration,
    getMetricsByOperation,
    getMetricsByTimeRange,
    getMetricsByType,
} from "../services/performanceMetrics.service";
import { ActivityType, EntityType } from "../models/activityLog.model";
import { StatisticType, TimePeriod } from "../models/statistic.model";
import { MatricType } from "../models/performanceMetric.model";

/**
 * Interface for user data
 */
// This interface is now defined globally in src/types/express.d.ts
// interface AuthenticatedRequest extends Request {
//     user?: {
//         id: number;
//         email: string;
//         role: string;
//     };
// }

/**
 * Analytics Controller
 *
 * Provides API endpoints for analytics functionality including:
 * - Activity logging
 * - Statistics generation and retrieval
 * - Performance metrics analysis
 */

/**
 * Get user activities with optional filtering
 */
export async function getUserActivities(req: Request, res: Response): Promise<void> {
    try {
        const { userId, actionType, entityType, entityId, startDate, endDate, limit = 50, page = 1 } = req.query;

        // Convert string parameters to appropriate types
        const parsedUserId = userId ? Number(userId) : undefined;
        const parsedEntityId = entityId ? Number(entityId) : undefined;
        const parsedStartDate = startDate ? new Date(startDate as string) : undefined;
        const parsedEndDate = endDate ? new Date(endDate as string) : undefined;
        const parsedLimit = Math.min(Number(limit), 100); // Cap at 100 for performance
        const parsedPage = Math.max(Number(page), 1); // Minimum page 1
        const offset = (parsedPage - 1) * parsedLimit;

        let activities;
        let totalCount = 0;

        // Determine which filter to apply based on parameters
        if (entityType && parsedEntityId) {
            // Get logs for specific entity instance
            try {
                activities = await getActivityLogsByEntityType(entityType as EntityType, parsedEntityId);
            } catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : String(error),
                });
                return;
            }
            totalCount = activities.length;
            // Apply pagination manually
            activities = activities.slice(offset, offset + parsedLimit);
        } else if (entityType) {
            // Get logs for entity type
            try {
                activities = await getActivityLogsByEntityType(entityType as EntityType);
            } catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : String(error),
                });
                return;
            }
            totalCount = activities.length;
            // Apply pagination manually
            activities = activities.slice(offset, offset + parsedLimit);
        } else if (parsedStartDate && parsedEndDate) {
            // Get activities by date range - using recent logs and filtering
            activities = await getRecentActivityLogs(1000); // Get a larger batch for filtering
            // Filter by date manually
            activities = activities.filter(
                (activity) => activity.createdAt >= parsedStartDate && activity.createdAt <= parsedEndDate
            );
            totalCount = activities.length;
            // Apply pagination manually
            activities = activities.slice(offset, offset + parsedLimit);
        } else if (actionType) {
            try {
                activities = await getActivityLogsByType(actionType as ActivityType);
                totalCount = activities.length;
                // Apply pagination manually
                activities = activities.slice(offset, offset + parsedLimit);
            } catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : String(error),
                });
                return;
            }
        } else if (parsedUserId) {
            activities = await getActivityLogsByUser(parsedUserId);
            totalCount = activities.length;
            // Apply pagination manually
            activities = activities.slice(offset, offset + parsedLimit);
        } else {
            // Get all activities with pagination
            // Fetch one more than the limit to determine if there are more pages
            activities = await getRecentActivityLogs(1000);
            totalCount = activities.length;
            // Apply pagination manually
            activities = activities.slice(offset, offset + parsedLimit);
        }

        // Return the paginated result
        res.status(200).json({
            success: true,
            data: activities,
            pagination: {
                total: totalCount,
                page: parsedPage,
                limit: parsedLimit,
                pages: Math.ceil(totalCount / parsedLimit),
            },
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(
            `Error fetching user activities: ${errorMessage}`,
            error instanceof Error ? error : new Error(errorMessage),
            "AnalyticsController"
        );
        res.status(500).json({
            success: false,
            message: "Failed to fetch user activities",
            error: errorMessage,
        });
    }
}

/**
 * Get statistics with optional filtering
 */
export async function getStatistics(req: Request, res: Response): Promise<void> {
    try {
        const { statisticType, timePeriod, category, startDate, endDate } = req.query;

        // Convert string parameters to appropriate types
        const parsedStartDate = startDate ? new Date(startDate as string) : undefined;
        const parsedEndDate = endDate ? new Date(endDate as string) : undefined;

        let statistics;
        if (statisticType) {
            try {
                statistics = await getStatisticsByType(statisticType as StatisticType);
            } catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : String(error),
                });
                return;
            }
        } else if (timePeriod) {
            try {
                statistics = await getStatisticsByTimePeriod(timePeriod as TimePeriod);
            } catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : String(error),
                });
                return;
            }
        } else if (category) {
            // statistics = await getStatisticsByCategory(category as string);
        } else if (parsedStartDate && parsedEndDate) {
            statistics = await getStatisticsByDateRange(parsedStartDate, parsedEndDate);
        } else {
            // Return error if no filter is provided
            res.status(400).json({
                success: false,
                message: "Please provide at least one filter criteria",
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: statistics,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(
            `Error fetching statistics: ${errorMessage}`,
            error instanceof Error ? error : new Error(errorMessage),
            "AnalyticsController"
        );
        res.status(500).json({
            success: false,
            message: "Failed to fetch statistics",
            error: errorMessage,
        });
    }
}

/**
 * Get latest statistic of a specific type
 */
export async function getLatestStatistic(req: Request, res: Response): Promise<void> {
    try {
        const { statisticType } = req.params;

        if (!statisticType) {
            res.status(400).json({
                success: false,
                message: "Statistic type is required",
            });
            return;
        }

        let statistic;
        try {
            statistic = await getLatestStatistics();
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : String(error),
            });
            return;
        }

        if (!statistic) {
            res.status(404).json({
                success: false,
                message: `No statistics found for type: ${statisticType}`,
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: statistic,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(
            `Error fetching latest statistic: ${errorMessage}`,
            error instanceof Error ? error : new Error(errorMessage),
            "AnalyticsController"
        );
        res.status(500).json({
            success: false,
            message: "Failed to fetch latest statistic",
            error: errorMessage,
        });
    }
}

/**
 * Get performance metrics with optional filtering
 */
export async function getPerformanceMetrics(req: Request, res: Response): Promise<void> {
    try {
        const { operation, metricType, startDate, endDate } = req.query;

        // Convert string parameters to appropriate types
        const parsedStartDate = startDate ? new Date(startDate as string) : undefined;
        const parsedEndDate = endDate ? new Date(endDate as string) : undefined;

        let metrics;
        if (operation) {
            metrics = await getMetricsByOperation(operation as string);
        } else if (metricType) {
            try {
                metrics = await getMetricsByType(metricType as MatricType);
            } catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : String(error),
                });
                return;
            }
        } else if (parsedStartDate && parsedEndDate) {
            metrics = await getMetricsByTimeRange(parsedStartDate, parsedEndDate);
        } else {
            // Return error if no filter is provided
            res.status(400).json({
                success: false,
                message: "Please provide at least one filter criteria",
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: metrics,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(
            `Error fetching performance metrics: ${errorMessage}`,
            error instanceof Error ? error : new Error(errorMessage),
            "AnalyticsController"
        );
        res.status(500).json({
            success: false,
            message: "Failed to fetch performance metrics",
            error: errorMessage,
        });
    }
}

/**
 * Get average duration for a specific operation
 */
export async function getAverageDuration(req: Request, res: Response): Promise<void> {
    try {
        const { operation } = req.params;
        const { startDate, endDate } = req.query;

        if (!operation) {
            res.status(400).json({
                success: false,
                message: "Operation is required",
            });
            return;
        }

        // Convert string parameters to appropriate types
        const parsedStartDate = startDate ? new Date(startDate as string) : undefined;
        const parsedEndDate = endDate ? new Date(endDate as string) : undefined;

        const averageDuration = await calculateAverageDuration(operation, parsedStartDate, parsedEndDate);

        res.status(200).json({
            success: true,
            data: {
                operation,
                averageDuration,
            },
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(
            `Error calculating average duration: ${errorMessage}`,
            error instanceof Error ? error : new Error(errorMessage),
            "AnalyticsController"
        );
        res.status(500).json({
            success: false,
            message: "Failed to calculate average duration",
            error: errorMessage,
        });
    }
}

/**
 * Get the slowest operations
 */
// export async function getSlowestOperations(req: Request, res: Response): Promise<void> {
//     try {
//         const { limit = 10 } = req.query;
//         const parsedLimit = Math.min(Number(limit), 50); // Cap at 50 for performance

//         // const slowestOperations = await getSlowestOperations(parsedLimit);

//         res.status(200).json({
//             success: true,
//             data: slowestOperations
//         });
//     } catch (error) {
//         const errorMessage = error instanceof Error ? error.message : String(error);
//         logger.error(`Error fetching slowest operations: ${errorMessage}`, error instanceof Error ? error : new Error(errorMessage), "AnalyticsController");
//         res.status(500).json({
//             success: false,
//             message: "Failed to fetch slowest operations",
//             error: errorMessage
//         });
//     }
// }

/**
 * Get list of all scheduled jobs
 */
export async function getScheduledJobs(req: Request, res: Response): Promise<void> {
    try {
        const jobs = JobScheduler.getScheduledJobs();

        res.status(200).json({
            success: true,
            data: jobs,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(
            `Error fetching scheduled jobs: ${errorMessage}`,
            error instanceof Error ? error : new Error(errorMessage),
            "AnalyticsController"
        );
        res.status(500).json({
            success: false,
            message: "Failed to fetch scheduled jobs",
            error: errorMessage,
        });
    }
}

/**
 * Run a specific job manually
 */
export async function runStatisticsJob(req: Request, res: Response): Promise<void> {
    try {
        const { jobName } = req.params;

        if (!jobName) {
            res.status(400).json({
                success: false,
                message: "Job name is required",
            });
            return;
        }

        const result = await JobScheduler.runJobNow(jobName);

        if (!result) {
            res.status(404).json({
                success: false,
                message: `Job '${jobName}' not found or failed to run`,
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: `Job '${jobName}' executed successfully`,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(
            `Error running statistics job: ${errorMessage}`,
            error instanceof Error ? error : new Error(errorMessage),
            "AnalyticsController"
        );
        res.status(500).json({
            success: false,
            message: "Failed to run statistics job",
            error: errorMessage,
        });
    }
}
