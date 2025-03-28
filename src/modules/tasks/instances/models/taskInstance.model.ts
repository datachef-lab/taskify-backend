import { boolean, integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { taskTemplateModel } from "../../templates/models";
import { customerModel } from "../../../stakeholders/models/customer.model";
import { priorityType } from "../../../../db-enums";
import { userModel } from "../../../user/models/user.model";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { taskInstanceDropdownTemplateModel } from "./joins.model";

/**
 * TaskInstance Model
 *
 * Represents a specific task (or workflow )that a user is working on. This is the top-level
 * entity in the instance hierarchy (Task > Function > Field > Input).
 *
 * A task instance is created from a task template and is assigned to specific users,
 * with fields for tracking its lifecycle, priority, and associated customer.
 */
export const taskInstanceModel = pgTable("task_instances", {
    id: serial().primaryKey(),

    // Link to the task template this instance is based on
    taskTemplateId: integer("task_template_id_fk")
        .references(() => taskTemplateModel.id)
        .notNull(),

    // Unique identifier code for the task (e.g., T-2023-001)
    code: varchar({ length: 255 }).notNull(),

    // Customer associated with this task
    customerId: integer("customer_id_fk")
        .references(() => customerModel.id)
        .notNull(),

    // Task priority for workflow management
    priority: priorityType().default("NORMAL").notNull(),

    // User tracking for audit and workflow management
    createdById: integer("created_by_user_id_fk")
        .references(() => userModel.id)
        .notNull(),
    assigneeId: integer("assigned_to_user_id_fk")
        .references(() => userModel.id)
        .notNull(),
    closedById: integer("closed_by_user_id_fk")
        .references(() => userModel.id)
        .notNull(),

    // Flag to indicate if the task has been archived
    isArchived: boolean().default(false),

    // Timestamps for tracking the task instance lifecycle
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    closedAt: timestamp(),
});

/**
 * TaskInstance Relationships
 *
 * Defines how the task instance relates to other entities:
 * - taskTemplate: The template this instance is based on
 * - customer: The customer associated with this task
 * - createdByUser: The user who created this task
 * - assignedToUser: The user responsible for completing this task
 * - closedByUser: The user who closed/completed this task
 * - dropdownTemplates: The dropdown templates used in this task instance
 */
export const taskInstanceRelations = relations(taskInstanceModel, ({ one, many }) => ({
    taskTemplate: one(taskTemplateModel, {
        fields: [taskInstanceModel.taskTemplateId],
        references: [taskTemplateModel.id],
    }),
    customer: one(customerModel, {
        fields: [taskInstanceModel.customerId],
        references: [customerModel.id],
    }),
    createdByUser: one(userModel, {
        fields: [taskInstanceModel.createdById],
        references: [userModel.id],
    }),
    assignedToUser: one(userModel, {
        fields: [taskInstanceModel.assigneeId],
        references: [userModel.id],
    }),
    closedByUser: one(userModel, {
        fields: [taskInstanceModel.closedById],
        references: [userModel.id],
    }),
    dropdownTemplates: many(taskInstanceDropdownTemplateModel),
}));

// Create validation schema using Zod
export const createTaskInstanceSchema = createInsertSchema(taskInstanceModel);

// TypeScript type for the task instance
export type TaskInstance = z.infer<typeof createTaskInstanceSchema>;
