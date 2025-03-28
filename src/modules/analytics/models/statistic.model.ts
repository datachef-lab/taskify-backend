import { jsonb, pgEnum, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Statistic Type Enum
 *
 * Defines the different types of statistics that can be tracked in the system.
 * This helps categorize metrics for easier retrieval and reporting.
 */
export const statisticTypeEnum = pgEnum("statistic_type", [
    "TASK_COMPLETION_RATE",
    "AVERAGE_TASK_DURATION",
    "USER_ACTIVITY",
    "TASK_DISTRIBUTION",
    "RESPONSE_TIME",
    "ERROR_RATE",
    "RESOURCE_USAGE",
    "CUSTOMER_ENGAGEMENT",
    "PERFORMANCE_METRIC",
    "CUSTOM_METRIC",
]);
export type StatisticType = (typeof statisticTypeEnum.enumValues)[number];

/**
 * Time Period Enum
 *
 * Defines the different time periods for aggregating statistics.
 * This helps in generating reports for different time frames.
 */
export const timePeriodEnum = pgEnum("time_period", [
    "HOURLY",
    "DAILY",
    "WEEKLY",
    "MONTHLY",
    "QUARTERLY",
    "YEARLY",
    "CUSTOM",
]);
export type TimePeriod = (typeof timePeriodEnum.enumValues)[number];

/**
 * Statistic Model
 *
 * Stores aggregated statistical data for various metrics in the system.
 * This model is used for performance monitoring, reporting, and analytics dashboards.
 *
 * Statistics are stored with dimension data (time period, category, etc.)
 * and metric values in JSON format to support various data types and structures.
 */
export const statisticModel = pgTable("statistics", {
    id: serial().primaryKey(),

    // The type of statistic being tracked
    statisticType: statisticTypeEnum().notNull(),

    // Time period this statistic covers
    timePeriod: timePeriodEnum().notNull(),

    // Name or title of the statistic
    name: varchar({ length: 255 }).notNull(),

    // Optional category for grouping related statistics
    category: varchar({ length: 100 }),

    // Description of what this statistic measures
    description: varchar({ length: 500 }),

    // Start time of the period this statistic covers
    periodStart: timestamp().notNull(),

    // End time of the period this statistic covers
    periodEnd: timestamp().notNull(),

    // The actual metric data in JSON format
    // This can include counts, averages, distributions, etc.
    data: jsonb("data").notNull(),

    // Additional dimensions or attributes for filtering
    dimensions: jsonb("dimensions"),

    // Timestamp when this statistic was created/calculated
    createdAt: timestamp().defaultNow().notNull(),

    // Timestamp when this statistic was last updated
    updatedAt: timestamp()
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});

/**
 * The statistics model doesn't have direct relations to other entities
 * since it's used for aggregated data. However, the data field may contain
 * references to other entities' IDs as part of the metric data.
 */

// Create validation schema using Zod
export const createStatisticSchema = createInsertSchema(statisticModel);

// TypeScript type for the statistic
export type Statistic = z.infer<typeof createStatisticSchema>;
