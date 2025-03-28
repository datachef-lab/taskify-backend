import { boolean, integer, jsonb, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { inputTemplateModel } from "../../templates/models/inputTemplate.model";
import { fieldInstanceModel } from "./fieldInstance.model";
import { userModel } from "../../../user/models/user.model";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { conditionalActionModel } from "../../templates/models/conditionalAction.model";

/**
 * InputInstance Model
 *
 * Represents an actual input value provided by a user in a form.
 * This is the lowest level entity in the instance hierarchy (Task > Function > Field > Input).
 *
 * Each input instance is based on an input template and stores the user's response.
 * The model supports both static inputs (defined in the template) and dynamic inputs
 * (created based on conditions during form filling).
 */
export const inputInstanceModel = pgTable("input_instances", {
    id: serial().primaryKey(),

    // Relations to templates and instances
    inputTemplateId: integer("input_template_id_fk")
        .references(() => inputTemplateModel.id)
        .notNull(),
    fieldInstanceId: integer("field_instance_id_fk")
        .references(() => fieldInstanceModel.id)
        .notNull(),

    // The actual value stored as JSONB to support different input types
    // This can store text, numbers, arrays (for multiple files), booleans, etc.
    value: jsonb("value"),

    // For file inputs, we store the file paths
    filePaths: jsonb("file_paths"),

    // Flag to indicate if this input was created dynamically through a conditional action
    isDynamicallyCreated: boolean("is_dynamically_created").default(false),

    // Reference to the conditional action that triggered this input (if any)
    // This is null for regular template-defined inputs
    triggeringConditionalActionId: integer("triggering_conditional_action_id_fk").references(
        () => conditionalActionModel.id
    ),

    // Track which user created and modified this input
    createdById: integer("created_by_user_id_fk")
        .references(() => userModel.id)
        .notNull(),
    updatedById: integer("updated_by_user_id_fk").references(() => userModel.id),

    // Additional remarks or notes about this input
    remarks: varchar({ length: 1000 }),

    // Timestamps
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});

/**
 * InputInstance Relationships
 *
 * Defines how the input instance relates to other entities:
 * - inputTemplate: The template this instance is based on
 * - fieldInstance: The field instance this input belongs to
 * - triggeringConditionalAction: The action that created this input (only for dynamic inputs)
 * - createdByUser: The user who created this input
 * - updatedByUser: The user who last updated this input
 */
export const inputInstanceRelations = relations(inputInstanceModel, ({ one }) => ({
    // Relation to the template that defines this input
    inputTemplate: one(inputTemplateModel, {
        fields: [inputInstanceModel.inputTemplateId],
        references: [inputTemplateModel.id],
    }),

    // Relation to the field instance this input belongs to
    fieldInstance: one(fieldInstanceModel, {
        fields: [inputInstanceModel.fieldInstanceId],
        references: [fieldInstanceModel.id],
    }),

    // Relation to the conditional action that created this input (if any)
    triggeringConditionalAction: one(conditionalActionModel, {
        fields: [inputInstanceModel.triggeringConditionalActionId],
        references: [conditionalActionModel.id],
    }),

    // Relations to users
    createdByUser: one(userModel, {
        fields: [inputInstanceModel.createdById],
        references: [userModel.id],
    }),
    updatedByUser: one(userModel, {
        fields: [inputInstanceModel.updatedById],
        references: [userModel.id],
    }),
}));

// Create validation schema using Zod
export const createInputInstanceSchema = createInsertSchema(inputInstanceModel);

// TypeScript type for the input instance
// Export TypeScript type
export type InputInstance = z.infer<typeof createInputInstanceSchema>;
