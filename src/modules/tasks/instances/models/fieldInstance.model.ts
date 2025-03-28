import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { fieldTemplateModel } from "../../templates/models";
import { fnInstanceModel } from "./fnInstance.model";
import { userModel } from "../../../user/models/user.model";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * FieldInstance Model
 *
 * Represents an instance of a field within a function instance.
 * A field is a logical grouping of inputs that users interact with.
 *
 * Fields are organized within functions, and contain inputs for data collection.
 * Each field instance is mapped to a field template that defines its structure.
 */
export const fieldInstanceModel = pgTable("field_instances", {
    id: serial().primaryKey(),

    // Link to the field template this instance is based on
    fieldTemplateId: integer("field_instance_id_fk")
        .references(() => fieldTemplateModel.id)
        .notNull(),

    // The function instance this field belongs to
    fnInstanceId: integer("field_instance_id_fk")
        .references(() => fnInstanceModel.id)
        .notNull(),

    // User tracking for audit and workflow purposes
    createdById: integer("created_by_user_id_fk")
        .references(() => userModel.id)
        .notNull(),
    closedById: integer("closed_by_user_id_fk")
        .references(() => userModel.id)
        .notNull(),

    // Timestamps for tracking the field instance lifecycle
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    closedAt: timestamp(),
});

/**
 * FieldInstance Relationships
 *
 * Defines how the field instance relates to other entities:
 * - fieldTemplate: The template this instance is based on
 * - fnInstance: The function instance this field belongs to
 * - createdByUser: The user who created this field instance
 * - closedByUser: The user who closed/completed this field instance
 */
export const fieldInstanceRelations = relations(fieldInstanceModel, ({ one }) => ({
    fieldTemplate: one(fieldTemplateModel, {
        fields: [fieldInstanceModel.fieldTemplateId],
        references: [fieldTemplateModel.id],
    }),
    fnInstance: one(fnInstanceModel, {
        fields: [fieldInstanceModel.fnInstanceId],
        references: [fnInstanceModel.id],
    }),
    createdByUser: one(userModel, {
        fields: [fieldInstanceModel.createdById],
        references: [userModel.id],
    }),
    closedByUser: one(userModel, {
        fields: [fieldInstanceModel.closedById],
        references: [userModel.id],
    }),
}));

// Create validation schema using Zod
export const createFieldInstanceSchema = createInsertSchema(fieldInstanceModel);

// TypeScript type for the field instance
export type FieldInstance = z.infer<typeof createFieldInstanceSchema>;
