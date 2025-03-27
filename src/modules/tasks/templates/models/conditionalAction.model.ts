import { integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { conditionalActionType } from "../../../../db-enums";
import { fieldTemplateModel } from "./fieldTemplate.model";
import { inputTemplateModel } from "./inputTemplate.model";
import { fnTemplateModel } from "./fnTemplate.model";
import { taskTemplateModel } from "./taskTemplate.model";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const conditionalActionModel = pgTable("condtional_actions", {
    id: serial().primaryKey(),
    inputTemplateId: integer("input_template_id_fk").references(() => inputTemplateModel.id),
    name: varchar({ length: 255 }).notNull(),
    type: conditionalActionType().default("ADD_DYNAMIC_INPUT"),
    description: varchar({ length: 500 }),
    targetedInputTemplateId: integer("targeted_input_template_id_fk").references(() => inputTemplateModel.id),
    targetedTaskTemplateId: integer("targeted_task_template_id_fk").references(() => taskTemplateModel.id),
    targetedFnTemplateId: integer("targeted_fn_template_id_fk").references(() => fnTemplateModel.id),
    targetedFieldTemplateId: integer("targeted_field_template_id_fk").references(() => fieldTemplateModel.id),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const conditionalActionRelations = relations(conditionalActionModel, ({ one }) => ({
    inputTemplate: one(inputTemplateModel, {
        fields: [conditionalActionModel.inputTemplateId],
        references: [inputTemplateModel.id],
    }),
    targetedInputTemplate: one(inputTemplateModel, {
        fields: [conditionalActionModel.targetedInputTemplateId],
        references: [inputTemplateModel.id],
    }),
    targetedTaskTemplate: one(taskTemplateModel, {
        fields: [conditionalActionModel.targetedTaskTemplateId],
        references: [taskTemplateModel.id],
    }),
    targetedFnTemplate: one(fnTemplateModel, {
        fields: [conditionalActionModel.targetedFnTemplateId],
        references: [fnTemplateModel.id],
    }),
    targetedFieldTemplate: one(fieldTemplateModel, {
        fields: [conditionalActionModel.targetedFieldTemplateId],
        references: [fieldTemplateModel.id],
    }),
}));

export const createConditionalActionSchema = createInsertSchema(conditionalActionModel);

export type ConditionalAction = z.infer<typeof createConditionalActionSchema>;
