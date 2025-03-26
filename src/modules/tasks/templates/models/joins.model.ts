import { integer, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { taskTemplateModel } from "./taskTemplate.model";
import { fnTemplateModel } from "./fnTemplate.model";
import { relations } from "drizzle-orm";
import { fieldTemplateModel } from "./fieldTemplate.model";
import { inputTemplateModel } from "./inputTemplate.model";

/* Join for Task-Template and Fn-Template models */
export const taskTemplateFnTemplateModel = pgTable(
    "task_templates_fn_templates",
    {
        taskTemplateId: integer("task_template_id_fk")
            .notNull()
            .references(() => taskTemplateModel.id),
        fnTemplateId: integer("fn_template_id_fk")
            .notNull()
            .references(() => fnTemplateModel.id),
    },
    (table) => ({
        primaryKey: primaryKey(table.taskTemplateId, table.fnTemplateId),
    })
);

export const taskTemplateFnTemplateRelations = relations(taskTemplateFnTemplateModel, ({ one }) => ({
    taskTemplate: one(taskTemplateModel, {
        fields: [taskTemplateFnTemplateModel.taskTemplateId],
        references: [taskTemplateModel.id],
    }),
    fnTemplate: one(fnTemplateModel, {
        fields: [taskTemplateFnTemplateModel.fnTemplateId],
        references: [fnTemplateModel.id],
    }),
}));

/* Join for Fn-Template and Field-Template models */
export const fnTemplateFieldTemplateModel = pgTable(
    "fn_template_field_templates",
    {
        fnTemplateId: integer("fn_template_id_fk")
            .notNull()
            .references(() => fnTemplateModel.id),
        fieldTemplateId: integer("field_template_id_fk")
            .notNull()
            .references(() => fieldTemplateModel.id),
    },
    (table) => ({
        primaryKey: primaryKey(table.fnTemplateId, table.fieldTemplateId),
    })
);

export const fnTemplateFieldTemplateRelations = relations(fnTemplateFieldTemplateModel, ({ one }) => ({
    fnTemplate: one(fnTemplateModel, {
        fields: [fnTemplateFieldTemplateModel.fnTemplateId],
        references: [fnTemplateModel.id],
    }),
    fieldTemplate: one(fieldTemplateModel, {
        fields: [fnTemplateFieldTemplateModel.fieldTemplateId],
        references: [fieldTemplateModel.id],
    }),
}));

/* Join for Field-Template and Input-Template models */
export const fieldTemplateInputTemplateModel = pgTable(
    "field_template_input_templates",
    {
        fieldTemplateId: integer("field_template_id_fk")
            .notNull()
            .references(() => fieldTemplateModel.id),
        inputTemplateId: integer("input_template_id_fk")
            .notNull()
            .references(() => inputTemplateModel.id),
    },
    (table) => ({
        primaryKey: primaryKey(table.fieldTemplateId, table.inputTemplateId),
    })
);

export const fieldTemplateInputTemplateRelations = relations(fieldTemplateInputTemplateModel, ({ one }) => ({
    fieldTemplate: one(fieldTemplateModel, {
        fields: [fieldTemplateInputTemplateModel.fieldTemplateId],
        references: [fieldTemplateModel.id],
    }),
    inputTemplate: one(inputTemplateModel, {
        fields: [fieldTemplateInputTemplateModel.inputTemplateId],
        references: [inputTemplateModel.id],
    }),
}));
