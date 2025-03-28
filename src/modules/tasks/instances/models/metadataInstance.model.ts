import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { metadataTemplateModel } from "../../templates/models/metadataTemplate.model";
import { taskInstanceModel } from "./taskInstance.model";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * MetadataInstance Model
 *
 * Represents additional metadata associated with a task instance.
 * The metadata instance connects task instances with their metadata templates,
 * which may contain information about the task that isn't directly part of
 * the user input form (e.g., system-level information, configuration, etc.).
 */
export const metadataInstanceModel = pgTable("metadata_instances", {
    id: serial().primaryKey(),

    // Link to the metadata template this instance is based on
    metadataTemplateId: integer("metadata_template_id_fk")
        .references(() => metadataTemplateModel.id)
        .notNull(),

    // The task instance this metadata is associated with
    taskInstanceId: integer("task_instance_id_fk")
        .references(() => taskInstanceModel.id)
        .notNull(),

    // Timestamps for tracking when the metadata was created and updated
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});

/**
 * MetadataInstance Relationships
 *
 * Defines how the metadata instance relates to other entities:
 * - metadataTemplate: The template this instance is based on
 * - taskInstance: The task instance this metadata belongs to
 */
export const metadataInstanceRelations = relations(metadataInstanceModel, ({ one }) => ({
    metadataTemplate: one(metadataTemplateModel, {
        fields: [metadataInstanceModel.metadataTemplateId],
        references: [metadataTemplateModel.id],
    }),
    taskInstance: one(taskInstanceModel, {
        fields: [metadataInstanceModel.taskInstanceId],
        references: [taskInstanceModel.id],
    }),
}));

// Create validation schema using Zod
export const createMetadataInstanceSchema = createInsertSchema(metadataInstanceModel);

// TypeScript type for the metadata instance
export type MetadataInstance = z.infer<typeof createMetadataInstanceSchema>;
