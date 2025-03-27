import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { metadataTemplateModel } from "../../templates/models/metadataTemplate.model";
import { taskInstanceModel } from "./taskInstance.model";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const metadataInstanceModel = pgTable("metadata_instances", {
    id: serial().primaryKey(),
    metadataTemplateId: integer("metadata_template_id_fk")
        .references(() => metadataTemplateModel.id)
        .notNull(),
    taskInstanceId: integer("task_instance_id_fk")
        .references(() => taskInstanceModel.id)
        .notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});

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

export const createMetadataInstanceSchema = createInsertSchema(metadataInstanceModel);

export type MetadataInstance = z.infer<typeof createMetadataInstanceSchema>;
