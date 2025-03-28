import { db } from "../../../db";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { Statistic, statisticModel, statisticTypeEnum, timePeriodEnum } from "../models/statistic.model";
import { logger } from "../../../utils/logger";

/**
 * Creates a new statistic entry in the database
 */
export async function createStatistic(
    statisticType: (typeof statisticTypeEnum.enumValues)[number],
    name: string,
    timePeriod: (typeof timePeriodEnum.enumValues)[number],
    periodStart: Date,
    periodEnd: Date,
    data: Record<string, unknown>,
    category?: string,
    description?: string,
    dimensions?: Record<string, unknown>
): Promise<number> {
    try {
        const result = await db
            .insert(statisticModel)
            .values({
                statisticType,
                name,
                timePeriod,
                periodStart,
                periodEnd,
                data,
                category,
                description,
                dimensions,
            })
            .returning({ id: statisticModel.id });

        return result[0].id;
    } catch (error) {
        logger.error("Error creating statistic", error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
}

/**
 * Get statistics by type
 */
export async function getStatisticsByType(type: (typeof statisticTypeEnum.enumValues)[number], limit: number = 100) {
    try {
        const statistics = await db
            .select()
            .from(statisticModel)
            .where(eq(statisticModel.statisticType, type))
            .orderBy(sql`${statisticModel.createdAt} DESC`)
            .limit(limit);

        return statistics;
    } catch (error) {
        logger.error("Error getting statistics by type", error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
}

/**
 * Get statistics by period
 */
export async function getStatisticsByTimePeriod(
    timePeriod: (typeof timePeriodEnum.enumValues)[number],
    limit: number = 100
) {
    try {
        const statistics = await db
            .select()
            .from(statisticModel)
            .where(eq(statisticModel.timePeriod, timePeriod))
            .orderBy(sql`${statisticModel.createdAt} DESC`)
            .limit(limit);

        return statistics;
    } catch (error) {
        logger.error(
            "Error getting statistics by time period",
            error instanceof Error ? error : new Error(String(error))
        );
        throw error;
    }
}

/**
 * Get statistics by date range
 */
export async function getStatisticsByDateRange(startDate: Date, endDate: Date, limit: number = 100) {
    try {
        const statistics = await db
            .select()
            .from(statisticModel)
            .where(and(gte(statisticModel.periodStart, startDate), lte(statisticModel.periodEnd, endDate)))
            .orderBy(sql`${statisticModel.createdAt} DESC`)
            .limit(limit);

        return statistics;
    } catch (error) {
        logger.error(
            "Error getting statistics by date range",
            error instanceof Error ? error : new Error(String(error))
        );
        throw error;
    }
}

/**
 * Get the latest statistic of a specific type
 */
export async function getLatestStatistics(limit: number = 20) {
    try {
        const statistics = await db
            .select()
            .from(statisticModel)
            .orderBy(sql`${statisticModel.createdAt} DESC`)
            .limit(limit);

        return statistics;
    } catch (error) {
        logger.error("Error getting latest statistics", error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
}

/**
 * Get the trend of a specific statistic type over time
 */
export async function getStatisticTrend(statisticType: (typeof statisticTypeEnum.enumValues)[number], limit = 10) {
    try {
        if (!statisticType) {
            throw new Error("Statistic type is required");
        }

        if (limit <= 0) {
            throw new Error("Limit must be greater than 0");
        }

        const statistics = await db
            .select()
            .from(statisticModel)
            .where(eq(statisticModel.statisticType, statisticType))
            .orderBy(desc(statisticModel.createdAt))
            .limit(limit);

        return statistics;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(
            `Error fetching statistic trend: ${errorMessage}`,
            error instanceof Error ? error : new Error(errorMessage)
        );
        throw error;
    }
}

/**
 * Calculate percentage change between latest and previous statistic
 */
export async function calculateStatisticChange(statisticType: (typeof statisticTypeEnum.enumValues)[number]) {
    try {
        if (!statisticType) {
            throw new Error("Statistic type is required");
        }

        const statistics = await db
            .select()
            .from(statisticModel)
            .where(eq(statisticModel.statisticType, statisticType))
            .orderBy(desc(statisticModel.createdAt))
            .limit(2);

        if (statistics.length < 2) {
            return {
                current: statistics[0]?.data ?? 0,
                previous: 0,
                percentageChange: 0,
            };
        }

        const current = Number(statistics[0].data);
        const previous = Number(statistics[1].data);
        const percentageChange = previous !== 0 ? ((current - previous) / previous) * 100 : 0;

        return {
            current,
            previous,
            percentageChange,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(
            `Error calculating statistic change: ${errorMessage}`,
            error instanceof Error ? error : new Error(errorMessage)
        );
        throw error;
    }
}

export async function getStatisticById(id: number): Promise<Statistic | null> {
    try {
        const statistic = await db.select().from(statisticModel).where(eq(statisticModel.id, id));
        return (statistic[0] as Statistic) || null;
    } catch (error) {
        logger.error("Error getting statistic by ID", error instanceof Error ? error : new Error(String(error)));
        return null;
    }
}

export async function getStatisticsByTypeAndPeriod(
    type: (typeof statisticTypeEnum.enumValues)[number],
    timePeriod: (typeof timePeriodEnum.enumValues)[number],
    limit: number = 50
) {
    try {
        const statistics = await db
            .select()
            .from(statisticModel)
            .where(and(eq(statisticModel.statisticType, type), eq(statisticModel.timePeriod, timePeriod)))
            .orderBy(sql`${statisticModel.createdAt} DESC`)
            .limit(limit);

        return statistics;
    } catch (error) {
        logger.error(
            "Error getting statistics by type and period",
            error instanceof Error ? error : new Error(String(error))
        );
        throw error;
    }
}

export async function deleteStatistic(id: number): Promise<boolean> {
    try {
        await db.delete(statisticModel).where(eq(statisticModel.id, id));
        return true;
    } catch (error) {
        logger.error("Error deleting statistic", error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
}

export async function deleteStatisticsByType(type: (typeof statisticTypeEnum.enumValues)[number]): Promise<boolean> {
    try {
        await db.delete(statisticModel).where(eq(statisticModel.statisticType, type));
        return true;
    } catch (error) {
        logger.error("Error deleting statistics by type", error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
}
