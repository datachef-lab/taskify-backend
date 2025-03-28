import { getRecentActivityLogs } from "../modules/analytics/services/logging.service";
import { getMetricsByTimeRange } from "../modules/analytics/services/performanceMetrics.service";
import { createStatistic } from "../modules/analytics/services/statistics.service";
import { logger } from "../utils/logger";

/**
 * Statistics Generator Job
 *
 * Handles periodic generation of statistics based on application data
 * This can be scheduled to run at regular intervals (hourly, daily, weekly, etc.)
 */
export class StatisticsGenerator {
    /**
     * Generate daily user activity statistics
     */
    static async generateDailyUserActivityStats() {
        try {
            logger.info("Generating daily user activity statistics", "StatisticsGenerator");

            // Get yesterday's date range
            const endDate = new Date();
            endDate.setHours(0, 0, 0, 0);

            const startDate = new Date(endDate);
            startDate.setDate(startDate.getDate() - 1);

            // Fetch all activities for yesterday
            // Get recent activities and filter by date range
            const allActivities = await getRecentActivityLogs(1000); // Get a large batch
            const activities = allActivities.filter(
                (activity) => activity.createdAt >= startDate && activity.createdAt <= endDate
            );

            // Skip if no activities
            if (activities.length === 0) {
                logger.info("No activities found for yesterday, skipping statistics generation", "StatisticsGenerator");
                return;
            }

            // Group activities by user
            const userActivities = new Map<number, number>();
            const actionTypeCount = new Map<string, number>();
            const resourceTypeCount = new Map<string, number>();

            activities.forEach((activity) => {
                // Count activities per user
                const userId = activity.userId;
                userActivities.set(userId, (userActivities.get(userId) || 0) + 1);

                // Count activities per action type
                const actionType = activity.activityType;
                actionTypeCount.set(actionType, (actionTypeCount.get(actionType) || 0) + 1);

                // Count activities per resource type
                const resourceType = activity.entityType || "unknown";
                resourceTypeCount.set(resourceType, (resourceTypeCount.get(resourceType) || 0) + 1);
            });

            // Calculate statistics
            const totalActivities = activities.length;
            const uniqueUsers = userActivities.size;
            const averageActivitiesPerUser = totalActivities / uniqueUsers;
            const mostActiveUsers = Array.from(userActivities.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([userId, count]) => ({ userId, count }));

            const mostCommonActionTypes = Array.from(actionTypeCount.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([type, count]) => ({ type, count }));

            const mostAccessedResources = Array.from(resourceTypeCount.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([type, count]) => ({ type, count }));

            // Store the activity statistics
            await createStatistic(
                "USER_ACTIVITY",
                "Daily User Activity Summary",
                "DAILY",
                startDate,
                endDate,
                {
                    totalActivities,
                    uniqueUsers,
                    averageActivitiesPerUser,
                    mostActiveUsers,
                    mostCommonActionTypes,
                    mostAccessedResources,
                },
                "user_engagement",
                "Summary of user activities for the previous day",
                { daily: true, user: true, activity: true }
            );

            logger.success("Successfully generated daily user activity statistics", "StatisticsGenerator");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(
                `Failed to generate daily user activity statistics: ${errorMessage}`,
                error instanceof Error ? error : new Error(errorMessage),
                "StatisticsGenerator"
            );
        }
    }

    /**
     * Generate API performance statistics
     */
    static async generateApiPerformanceStats() {
        try {
            logger.info("Generating API performance statistics", "StatisticsGenerator");

            // Get time range for the last 24 hours
            const endDate = new Date();
            const startDate = new Date(endDate);
            startDate.setDate(startDate.getDate() - 1);

            // Fetch performance metrics for the last 24 hours
            const metrics = await getMetricsByTimeRange(startDate, endDate);

            // Filter only API metrics
            const apiMetrics = metrics.filter((metric) => metric.metricType === "API_RESPONSE_TIME");

            if (apiMetrics.length === 0) {
                logger.info(
                    "No API metrics found for the last 24 hours, skipping statistics generation",
                    "StatisticsGenerator"
                );
                return;
            }

            // Group by operation (endpoint)
            const operationMetrics = new Map<string, number[]>();

            apiMetrics.forEach((metric) => {
                const operation = metric.operation;
                if (!operationMetrics.has(operation)) {
                    operationMetrics.set(operation, []);
                }
                operationMetrics.get(operation)?.push(metric.durationMs);
            });

            // Calculate statistics for each operation
            const operationStats = Array.from(operationMetrics.entries()).map(([operation, durations]) => {
                // Sort durations for percentile calculations
                durations.sort((a, b) => a - b);

                // Calculate statistics
                const count = durations.length;
                const total = durations.reduce((sum, duration) => sum + duration, 0);
                const average = total / count;
                const min = durations[0];
                const max = durations[durations.length - 1];

                // Calculate percentiles
                const p50Index = Math.floor(count * 0.5);
                const p95Index = Math.floor(count * 0.95);
                const p99Index = Math.floor(count * 0.99);

                const p50 = durations[p50Index];
                const p95 = durations[p95Index];
                const p99 = durations[p99Index];

                return {
                    operation,
                    count,
                    min,
                    max,
                    average,
                    p50,
                    p95,
                    p99,
                };
            });

            // Sort by average duration (descending)
            operationStats.sort((a, b) => b.average - a.average);

            // Store the performance statistics
            await createStatistic(
                "PERFORMANCE_METRIC",
                "API Performance Summary",
                "DAILY",
                startDate,
                endDate,
                {
                    totalApiCalls: apiMetrics.length,
                    uniqueEndpoints: operationMetrics.size,
                    operationStats: operationStats,
                    slowestOperations: operationStats.slice(0, 5),
                },
                "system_performance",
                "Summary of API performance metrics for the last 24 hours",
                { daily: true, api: true, performance: true }
            );

            logger.success("Successfully generated API performance statistics", "StatisticsGenerator");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(
                `Failed to generate API performance statistics: ${errorMessage}`,
                error instanceof Error ? error : new Error(errorMessage),
                "StatisticsGenerator"
            );
        }
    }

    /**
     * Run all statistics generation jobs
     */
    static async runAllJobs() {
        try {
            logger.info("Starting statistics generation jobs", "StatisticsGenerator");

            // Run all statistics generation jobs
            await this.generateDailyUserActivityStats();
            await this.generateApiPerformanceStats();

            logger.success("Completed all statistics generation jobs", "StatisticsGenerator");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(
                `Error running statistics generation jobs: ${errorMessage}`,
                error instanceof Error ? error : new Error(errorMessage),
                "StatisticsGenerator"
            );
        }
    }
}
