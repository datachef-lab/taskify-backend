import { integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { fnTemplateModel, taskTemplateModel } from "../../templates/models";
import { userModel } from "../../../user/models/user.model";
import { relations } from "drizzle-orm";
import { taskInstanceModel } from "./taskInstance.model";
import { fnInstanceDropdownTemplateModel } from "./joins.model";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * FnInstance Model
 *
 * Represents a function instance (intermediate steps) within a task. Functions are logical groupings of fields
 * that serve a specific purpose within a workflow (like "Collect Customer Information" or
 * "Process Payment Details").
 *
 * Each function instance is based on a function template and contains multiple field instances.
 * Functions help organize complex forms into manageable sections with their own lifecycle.
 */
export const fnInstanceModel = pgTable("fn_instances", {
    id: serial().primaryKey(),

    // Link to the function template this instance is based on
    fnTemplateId: integer("fn_template_id_fk")
        .references(() => fnTemplateModel.id)
        .notNull(),

    // The task instance this function belongs to
    taskInstanceId: integer("task_instance_id_fk")
        .references(() => taskTemplateModel.id)
        .notNull(),

    // Additional notes or comments about this function instance
    remarks: varchar({ length: 1000 }),

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

    // Timestamps for tracking the function instance lifecycle
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    closedAt: timestamp(),
});

/**
 * FnInstance Relationships
 *
 * Defines how the function instance relates to other entities:
 * - fnTemplate: The template this instance is based on
 * - taskInstance: The task instance this function belongs to
 * - createdByUser: The user who created this function
 * - assignedToUser: The user responsible for completing this function
 * - closedByUser: The user who closed/completed this function
 * - dropdownTemplates: The dropdown templates used in this function instance
 */
export const fnInstanceRelations = relations(fnInstanceModel, ({ one, many }) => ({
    fnTemplate: one(fnTemplateModel, {
        fields: [fnInstanceModel.fnTemplateId],
        references: [fnTemplateModel.id],
    }),
    taskInstance: one(taskInstanceModel, {
        fields: [fnInstanceModel.taskInstanceId],
        references: [taskInstanceModel.id],
    }),
    createdByUser: one(userModel, {
        fields: [fnInstanceModel.createdById],
        references: [userModel.id],
    }),
    assignedToUser: one(userModel, {
        fields: [fnInstanceModel.assigneeId],
        references: [userModel.id],
    }),
    closedByUser: one(userModel, {
        fields: [fnInstanceModel.closedById],
        references: [userModel.id],
    }),
    dropdownTemplates: many(fnInstanceDropdownTemplateModel),
}));

// Create validation schema using Zod
export const createFnInstanceSchema = createInsertSchema(fnInstanceModel);

// TypeScript type for the function instance
export type FnInstance = z.infer<typeof createFnInstanceSchema>;
