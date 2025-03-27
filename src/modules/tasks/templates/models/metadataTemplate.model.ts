import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { taskTemplateModel } from "./taskTemplate.model";
import { fnTemplateModel } from "./fnTemplate.model";
import { fieldTemplateModel } from "./fieldTemplate.model";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { inputTemplateModel } from "./inputTemplate.model";

export const metadataTemplateModel = pgTable("metadata_templates", {
    id: serial().primaryKey(),
    inputTemplateId: integer("input_template_id_fk").references(() => inputTemplateModel.id),
    taskTemplateId: integer("task_template_id_fk").references(() => taskTemplateModel.id),
    fnTemplateId: integer("fn_template_id_fk").references(() => fnTemplateModel.id),
    fieldTemplateId: integer("field_template_id_fk").references(() => fieldTemplateModel.id),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const metadataTemplateRelations = relations(metadataTemplateModel, ({ one }) => ({
    inputTemplate: one(inputTemplateModel, {
        fields: [metadataTemplateModel.inputTemplateId],
        references: [inputTemplateModel.id],
    }),
    taskTemplate: one(taskTemplateModel, {
        fields: [metadataTemplateModel.taskTemplateId],
        references: [taskTemplateModel.id],
    }),
    fnTemplate: one(fnTemplateModel, {
        fields: [metadataTemplateModel.fnTemplateId],
        references: [fnTemplateModel.id],
    }),
    fieldTemplate: one(fieldTemplateModel, {
        fields: [metadataTemplateModel.fieldTemplateId],
        references: [fieldTemplateModel.id],
    }),
}));

export const createMetadataTemplateSchema = createInsertSchema(metadataTemplateModel);

export type MetadataTemplate = z.infer<typeof createMetadataTemplateSchema>;
