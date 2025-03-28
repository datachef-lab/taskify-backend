import { integer, jsonb, pgEnum, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { userModel } from "../../user/models/user.model";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Activity Type Enum
 *
 * Defines the different types of activities that can be logged in the system.
 * This enum helps categorize activities for better filtering and reporting.
 */
export const activityTypeEnum = pgEnum("activity_type", [
    "LOGIN",
    "LOGOUT",
    "CREATE",
    "UPDATE",
    "DELETE",
    "VIEW",
    "EXPORT",
    "IMPORT",
    "ASSIGN",
    "COMPLETE",
    "APPROVE",
    "REJECT",
    "COMMENT",
    "NOTIFICATION",
    "ERROR",
    "OTHER",
]);
export type ActivityType = (typeof activityTypeEnum.enumValues)[number];

/**
 * Entity Type Enum
 *
 * Defines the different types of entities that can be the subject of activities.
 * This helps in organizing activities by the type of element they affect.
 */
export const entityTypeEnum = pgEnum("entity_type", [
    "TASK",
    "FUNCTION",
    "FIELD",
    "INPUT",
    "USER",
    "CUSTOMER",
    "REPORT",
    "NOTIFICATION",
    "SETTING",
    "OTHER",
]);
// Extract the type for type-safe usage
export type EntityType = (typeof entityTypeEnum.enumValues)[number];

/**
 * ActivityLog Model
 *
 * Comprehensive logging model that tracks all user activities in the system.
 * This model records who did what, when, and to which entity, along with additional context.
 *
 * The activity log is essential for audit trails, user behavior analytics,
 * troubleshooting, and security monitoring.
 */
export const activityLogModel = pgTable("activity_logs", {
    id: serial().primaryKey(),

    // Type of activity (create, update, delete, etc.)
    activityType: activityTypeEnum().notNull(),

    // The type of entity affected (task, function, field, etc.)
    entityType: entityTypeEnum().notNull(),

    // ID of the specific entity affected
    entityId: integer("entity_id").notNull(),

    // User who performed the action
    userId: integer("user_id_fk")
        .references(() => userModel.id)
        .notNull(),

    // IP address of the user when the action was performed
    ipAddress: varchar({ length: 45 }),

    // Brief description of the activity
    description: varchar({ length: 500 }).notNull(),

    // Detailed information about the activity in JSON format
    // Can include before/after states, parameters used, etc.
    details: jsonb("details"),

    // Status code or result of the activity (e.g., success, error)
    statusCode: integer("status_code"),

    // Any tags or labels to categorize the activity
    tags: jsonb("tags"),

    // Timestamp when the activity occurred
    createdAt: timestamp().defaultNow().notNull(),
});

/**
 * ActivityLog Relationships
 *
 * Defines how the activity log relates to other entities:
 * - user: The user who performed the activity
 */
export const activityLogRelations = relations(activityLogModel, ({ one }) => ({
    user: one(userModel, {
        fields: [activityLogModel.userId],
        references: [userModel.id],
    }),
}));

// Create validation schema using Zod
export const createActivityLogSchema = createInsertSchema(activityLogModel);

// TypeScript type for the activity log
export type ActivityLog = z.infer<typeof createActivityLogSchema>;
