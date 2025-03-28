import { db } from "../../../db";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { metricTypeEnum, performanceMetricModel } from "../models/performanceMetric.model";
import { logger } from "../../../utils/logger";

/**
 * Record a new performance metric
 */
export async function recordMetric(data: {
    operation: string;
    metricType: (typeof metricTypeEnum.enumValues)[number];
    durationMs: number;
    httpMethod?: string;
    statusCode?: number;
    entityType?: string;
    entityId?: number;
    userId?: number;
    requestDetails?: Record<string, unknown>;
    responseSize?: number;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
}) {
    try {
        const result = await db.insert(performanceMetricModel).values({
            operation: data.operation,
            metricType: data.metricType,
            durationMs: data.durationMs,
            httpMethod: data.httpMethod,
            statusCode: data.statusCode,
            entityType: data.entityType,
            entityId: data.entityId,
            userId: data.userId,
            requestDetails: data.requestDetails,
            responseSize: data.responseSize,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            metadata: data.metadata,
        });

        return result;
    } catch (error) {
        logger.error("Error recording performance metric", error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
}

/**
 * Get metrics by operation
 */
export async function getMetricsByOperation(operation: string) {
    try {
        if (!operation) {
            throw new Error("Operation is required");
        }

        const metrics = await db
            .select()
            .from(performanceMetricModel)
            .where(eq(performanceMetricModel.operation, operation))
            .orderBy(sql`${performanceMetricModel.createdAt} DESC`);

        return metrics;
    } catch (error) {
        logger.error("Error fetching metrics by operation", error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
}

/**
 * Get metrics by type
 */
export async function getMetricsByType(metricType: (typeof metricTypeEnum.enumValues)[number]) {
    try {
        if (!metricType) {
            throw new Error("Metric type is required");
        }

        const metrics = await db
            .select()
            .from(performanceMetricModel)
            .where(eq(performanceMetricModel.metricType, metricType))
            .orderBy(sql`${performanceMetricModel.createdAt} DESC`);

        return metrics;
    } catch (error) {
        logger.error("Error fetching metrics by type", error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
}

/**
 * Get metrics in a time range
 */
export async function getMetricsByTimeRange(startDate: Date, endDate: Date) {
    try {
        if (!startDate || !endDate) {
            throw new Error("Start date and end date are required");
        }

        if (startDate > endDate) {
            throw new Error("Start date must be before end date");
        }

        const metrics = await db
            .select()
            .from(performanceMetricModel)
            .where(
                and(gte(performanceMetricModel.createdAt, startDate), lte(performanceMetricModel.createdAt, endDate))
            )
            .orderBy(sql`${performanceMetricModel.createdAt} DESC`);

        return metrics;
    } catch (error) {
        logger.error("Error fetching metrics by time range", error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
}

/**
 * Calculate average duration for an operation
 */
export async function calculateAverageDuration(operation: string, startDate?: Date, endDate?: Date) {
    try {
        if (!operation) {
            throw new Error("Operation is required");
        }

        let query = db
            .select({
                avgDuration: sql`AVG(${performanceMetricModel.durationMs})::float`,
            })
            .from(performanceMetricModel)
            .where(eq(performanceMetricModel.operation, operation));

        // Add date range filter if provided
        if (startDate && endDate) {
            query = db
                .select({
                    avgDuration: sql`AVG(${performanceMetricModel.durationMs})::float`,
                })
                .from(performanceMetricModel)
                .where(
                    and(
                        eq(performanceMetricModel.operation, operation),
                        gte(performanceMetricModel.createdAt, startDate),
                        lte(performanceMetricModel.createdAt, endDate)
                    )
                );
        }

        const result = await query;

        if (!result.length || result[0].avgDuration === null) {
            return 0;
        }

        return result[0].avgDuration;
    } catch (error) {
        logger.error("Error calculating average duration", error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
}

/**
 * Get the slowest operations
 */
export async function getSlowestOperations(limit = 10) {
    try {
        if (limit <= 0) {
            throw new Error("Limit must be greater than 0");
        }

        const result = await db
            .select({
                operation: performanceMetricModel.operation,
                avgDuration: sql`AVG(${performanceMetricModel.durationMs})::float`,
                count: sql`COUNT(*)::int`,
            })
            .from(performanceMetricModel)
            .groupBy(performanceMetricModel.operation)
            .orderBy(sql`AVG(${performanceMetricModel.durationMs}) DESC`)
            .limit(limit);

        return result;
    } catch (error) {
        logger.error("Error getting slowest operations", error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
}

/**
 * Get error rate by operation
 */
export async function getErrorRateByOperation(operation: string) {
    try {
        if (!operation) {
            throw new Error("Operation is required");
        }

        const totalQuery = await db
            .select({
                count: sql`COUNT(*)::int`,
            })
            .from(performanceMetricModel)
            .where(eq(performanceMetricModel.operation, operation));

        const errorQuery = await db
            .select({
                count: sql`COUNT(*)::int`,
            })
            .from(performanceMetricModel)
            .where(and(eq(performanceMetricModel.operation, operation), gte(performanceMetricModel.statusCode, 400)));

        const total = Number(totalQuery[0]?.count) || 0;
        const errors = Number(errorQuery[0]?.count) || 0;

        const errorRate = total > 0 ? (errors / total) * 100 : 0;

        return {
            operation,
            total,
            errors,
            errorRate,
        };
    } catch (error) {
        logger.error("Error calculating error rate", error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
}
