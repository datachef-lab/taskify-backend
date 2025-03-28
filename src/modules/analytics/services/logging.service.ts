import { db } from "../../../db";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { ActivityLog, activityLogModel, activityTypeEnum, entityTypeEnum } from "../models/activityLog.model";
import { logger } from "../../../utils/logger";

/**
 * Create a new activity log entry
 */
export async function createActivityLog(logData: {
    userId: number;
    activityType: (typeof activityTypeEnum.enumValues)[number];
    entityType: (typeof entityTypeEnum.enumValues)[number];
    entityId?: number;
    entityIdString?: string;
    description: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    statusCode?: number;
    tags?: string[];
}) {
    try {
        // Insert the log
        const result = await db.insert(activityLogModel).values({
            userId: logData.userId,
            activityType: logData.activityType,
            entityType: logData.entityType,
            entityId: logData.entityId !== undefined ? logData.entityId : sql`NULL`,
            description: logData.description,
            details: logData.details || null,
            ipAddress: logData.ipAddress || null,
            statusCode: logData.statusCode || null,
            tags: logData.tags || null,
            createdAt: new Date(),
        });

        return result;
    } catch (error) {
        logger.error("Error creating activity log", error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
}

/**
 * Get activity logs by user ID
 */
export async function getActivityLogsByUser(userId: number, limit = 100) {
    try {
        // Validate userId
        if (!userId || userId <= 0) {
            throw new Error("Invalid user ID");
        }

        const logs = await db
            .select()
            .from(activityLogModel)
            .where(eq(activityLogModel.userId, userId))
            .orderBy(sql`${activityLogModel.createdAt} DESC`)
            .limit(limit);

        return logs;
    } catch (error) {
        logger.error("Error fetching activity logs by user", error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
}

/**
 * Get activity logs by activity type
 */
export async function getActivityLogsByType(activityType: (typeof activityTypeEnum.enumValues)[number], limit = 100) {
    try {
        const logs = await db
            .select()
            .from(activityLogModel)
            .where(eq(activityLogModel.activityType, activityType))
            .orderBy(sql`${activityLogModel.createdAt} DESC`)
            .limit(limit);

        return logs;
    } catch (error) {
        logger.error("Error fetching activity logs by type", error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
}

/**
 * Get activity logs by entity type
 */
export async function getActivityLogsByEntityType(entityType: (typeof entityTypeEnum.enumValues)[number], limit = 100) {
    try {
        const logs = await db
            .select()
            .from(activityLogModel)
            .where(eq(activityLogModel.entityType, entityType))
            .orderBy(sql`${activityLogModel.createdAt} DESC`)
            .limit(limit);

        return logs;
    } catch (error) {
        logger.error(
            "Error fetching activity logs by entity type",
            error instanceof Error ? error : new Error(String(error))
        );
        throw error;
    }
}

/**
 * Get activity logs by entity (type and ID)
 */
export async function getEntityActivityLogs(
    entityType: (typeof entityTypeEnum.enumValues)[number],
    entityId: number | string,
    limit = 100
) {
    try {
        if (typeof entityId === "number") {
            const logs = await db
                .select()
                .from(activityLogModel)
                .where(and(eq(activityLogModel.entityType, entityType), eq(activityLogModel.entityId, entityId)))
                .orderBy(sql`${activityLogModel.createdAt} DESC`)
                .limit(limit);

            return logs;
        } else {
            const logs = await db
                .select()
                .from(activityLogModel)
                .where(
                    and(eq(activityLogModel.entityType, entityType), sql`${activityLogModel.entityId} = ${entityId}`)
                )
                .orderBy(sql`${activityLogModel.createdAt} DESC`)
                .limit(limit);

            return logs;
        }
    } catch (error) {
        logger.error("Error fetching entity activity logs", error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
}

/**
 * Get recent activity logs with limit
 */
export async function getRecentActivityLogs(limit = 100) {
    try {
        // Validate limit
        if (limit <= 0) {
            throw new Error("Limit must be greater than 0");
        }

        const logs = await db
            .select()
            .from(activityLogModel)
            .orderBy(sql`${activityLogModel.createdAt} DESC`)
            .limit(limit);

        return logs;
    } catch (error) {
        logger.error("Error fetching recent activity logs", error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
}

/**
 * Get activity logs by date range
 */
export async function getActivityLogsByDateRange(startDate: Date, endDate: Date, limit = 100) {
    try {
        // Validate dates
        if (!startDate || !endDate) {
            throw new Error("Start date and end date are required");
        }

        if (startDate > endDate) {
            throw new Error("Start date must be before end date");
        }

        const logs = await db
            .select()
            .from(activityLogModel)
            .where(and(gte(activityLogModel.createdAt, startDate), lte(activityLogModel.createdAt, endDate)))
            .orderBy(sql`${activityLogModel.createdAt} DESC`)
            .limit(limit);

        return logs;
    } catch (error) {
        logger.error(
            "Error fetching activity logs by date range",
            error instanceof Error ? error : new Error(String(error))
        );
        throw error;
    }
}

/**
 * Delete activity logs older than specified days
 */
export async function deleteOldActivityLogs(olderThanDays = 90) {
    try {
        // Validate days
        if (olderThanDays <= 0) {
            throw new Error("Days must be greater than 0");
        }

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

        // Execute the deletion query
        await db.delete(activityLogModel).where(lte(activityLogModel.createdAt, cutoffDate));

        return { success: true };
    } catch (error) {
        logger.error("Error deleting old activity logs", error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
}

/**
 * Log user activity - simplified version of createActivityLog
 */
export async function logUserActivity(activityData: {
    userId: number;
    activityType: (typeof activityTypeEnum.enumValues)[number];
    entityType: (typeof entityTypeEnum.enumValues)[number];
    entityId?: number;
    entityIdString?: string;
    ipAddress?: string;
    description?: string;
    details?: Record<string, unknown>;
    statusCode?: number;
    tags?: string[];
}) {
    try {
        const result = await db.insert(activityLogModel).values({
            userId: activityData.userId,
            activityType: activityData.activityType,
            entityType: activityData.entityType,
            entityId: activityData.entityId || null,
            ipAddress: activityData.ipAddress || null,
            description: activityData.description || null,
            details: activityData.details || null,
            statusCode: activityData.statusCode || null,
            tags: activityData.tags || null,
            createdAt: new Date(),
        } as ActivityLog);

        return result;
    } catch (error) {
        logger.error("Error logging user activity", error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
}
