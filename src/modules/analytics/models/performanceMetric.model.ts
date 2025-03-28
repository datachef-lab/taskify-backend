import { doublePrecision, integer, jsonb, pgEnum, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Metric Type Enum
 *
 * Defines the different types of performance metrics that can be tracked.
 * This helps categorize performance data for analysis and monitoring.
 */
export const metricTypeEnum = pgEnum("metric_type", [
    "API_RESPONSE_TIME",
    "DATABASE_QUERY_TIME",
    "RENDERING_TIME",
    "MEMORY_USAGE",
    "CPU_USAGE",
    "NETWORK_LATENCY",
    "ERROR_COUNT",
    "REQUEST_COUNT",
    "CONCURRENT_USERS",
    "SYSTEM_METRIC",
]);
export type MatricType = (typeof metricTypeEnum.enumValues)[number];

/**
 * PerformanceMetric Model
 *
 * Stores detailed performance metrics for monitoring system health and performance.
 * This model tracks response times, resource usage, and other performance indicators
 * at a granular level for specific endpoints, queries, or operations.
 */
export const performanceMetricModel = pgTable("performance_metrics", {
    id: serial().primaryKey(),

    // The type of metric being tracked
    metricType: metricTypeEnum().notNull(),

    // Name of the operation or endpoint being measured
    operation: varchar({ length: 255 }).notNull(),

    // Duration in milliseconds
    durationMs: doublePrecision("duration_ms").notNull(),

    // HTTP method if this is an API endpoint
    httpMethod: varchar({ length: 10 }),

    // HTTP status code if this is an API response
    statusCode: integer("status_code"),

    // Entity type affected (e.g., task, user)
    entityType: varchar({ length: 100 }),

    // Entity ID affected
    entityId: integer("entity_id"),

    // User ID who initiated the operation (if applicable)
    userId: integer("user_id"),

    // Request parameters or details
    requestDetails: jsonb("request_details"),

    // Response size in bytes
    responseSize: integer("response_size"),

    // IP address of the client
    ipAddress: varchar({ length: 45 }),

    // User agent string
    userAgent: varchar({ length: 500 }),

    // Any additional data about the operation
    metadata: jsonb("metadata"),

    // Timestamp when this metric was recorded
    createdAt: timestamp().defaultNow().notNull(),
});

/**
 * Performance metrics typically don't have direct relations to other entities
 * since they're used for system monitoring. However, they may store references
 * to users, entities, or operations through their fields.
 */

// Create validation schema using Zod
export const createPerformanceMetricSchema = createInsertSchema(performanceMetricModel);

// TypeScript type for the performance metric
export type PerformanceMetric = z.infer<typeof createPerformanceMetricSchema>;
