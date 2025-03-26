import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { dropdownItemModel } from "./dropdownItem.model";
import { taskTemplateModel } from "./taskTemplate.model";
import { fnTemplateModel } from "./fnTemplate.model";
import { inputTemplateModel } from "./inputTemplate.model";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const dropdownTemplateModel = pgTable("dropdown_templates", {
    id: serial().primaryKey(),
    dropdownItemId: integer("dropdown_item_id_fk")
        .notNull()
        .references(() => dropdownItemModel.id),
    taskTemplateId: integer("task_template_id_fk").references(() => taskTemplateModel.id),
    fnTemplateId: integer("fn_template_id_fk").references(() => fnTemplateModel.id),
    inputTemplateId: integer("input_template_id_fk").references(() => inputTemplateModel.id),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const dropdownTemplateRelations = relations(dropdownTemplateModel, ({ one }) => ({
    dropdownItem: one(dropdownItemModel, {
        fields: [dropdownTemplateModel.dropdownItemId],
        references: [dropdownItemModel.id],
    }),
    taskTemplate: one(taskTemplateModel, {
        fields: [dropdownTemplateModel.taskTemplateId],
        references: [taskTemplateModel.id],
    }),
    fnTemplate: one(fnTemplateModel, {
        fields: [dropdownTemplateModel.fnTemplateId],
        references: [fnTemplateModel.id],
    }),
    inputTemplate: one(inputTemplateModel, {
        fields: [dropdownTemplateModel.inputTemplateId],
        references: [inputTemplateModel.id],
    }),
}));

export const createDropdownTemplateSchema = createInsertSchema(dropdownTemplateModel);

export type DropdownTemplate = z.infer<typeof createDropdownTemplateSchema>;
