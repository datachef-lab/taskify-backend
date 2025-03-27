import { integer, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { taskInstanceModel } from "./taskInstance.model";
import { dropdownTemplateModel } from "../../templates/models";
import { relations } from "drizzle-orm";
import { fnInstanceModel } from "./fnInstance.model";

/* Join for Task-Instance and Dropdown-Template models */
export const taskInstanceDropdownTemplateModel = pgTable(
    "task_instances_dropdown_templates",
    {
        taskInstanceId: integer("task_instance_id_fk")
            .notNull()
            .references(() => taskInstanceModel.id),
        dropdownTemplateId: integer("dropdown_template_id_fk")
            .notNull()
            .references(() => dropdownTemplateModel.id),
    },
    (table) => ({
        primaryKey: primaryKey(table.taskInstanceId, table.dropdownTemplateId),
    })
);

export const taskInstanceDropdownTemplateRelations = relations(taskInstanceDropdownTemplateModel, ({ one }) => ({
    taskInstance: one(taskInstanceModel, {
        fields: [taskInstanceDropdownTemplateModel.taskInstanceId],
        references: [taskInstanceModel.id],
    }),
    dropdownTemplate: one(dropdownTemplateModel, {
        fields: [taskInstanceDropdownTemplateModel.dropdownTemplateId],
        references: [dropdownTemplateModel.id],
    }),
}));

/* Join for Fn-Instance and Dropdown-Template models */
export const fnInstanceDropdownTemplateModel = pgTable(
    "fn_instances_dropdown_templates",
    {
        fnInstanceId: integer("fn_instance_id_fk")
            .notNull()
            .references(() => fnInstanceModel.id),
        dropdownTemplateId: integer("dropdown_template_id_fk")
            .notNull()
            .references(() => dropdownTemplateModel.id),
    },
    (table) => ({
        primaryKey: primaryKey(table.fnInstanceId, table.dropdownTemplateId),
    })
);

export const fnInstanceDropdownTemplateRelations = relations(fnInstanceDropdownTemplateModel, ({ one }) => ({
    fnInstance: one(fnInstanceModel, {
        fields: [fnInstanceDropdownTemplateModel.fnInstanceId],
        references: [fnInstanceModel.id],
    }),
    dropdownTemplate: one(dropdownTemplateModel, {
        fields: [fnInstanceDropdownTemplateModel.dropdownTemplateId],
        references: [dropdownTemplateModel.id],
    }),
}));

// /* Join for Fn-Instance and Dropdown-Template models */
// export const fnInstanceDropdownTemplateModel = pgTable(
//     "fn_instances_dropdown_templates",
//     {
//         fnInstanceId: integer("fn_instance_id_fk")
//             .notNull()
//             .references(() => fnInstanceModel.id),
//         dropdownTemplateId: integer("dropdown_template_id_fk")
//             .notNull()
//             .references(() => dropdownTemplateModel.id),
//     },
//     (table) => ({
//         primaryKey: primaryKey(table.fnInstanceId, table.dropdownTemplateId),
//     })
// );

// export const fnInstanceDropdownTemplateRelations = relations(fnInstanceDropdownTemplateModel, ({ one }) => ({
//     fnInstance: one(fnInstanceModel, {
//         fields: [fnInstanceDropdownTemplateModel.fnInstanceId],
//         references: [fnInstanceModel.id],
//     }),
//     dropdownTemplate: one(dropdownTemplateModel, {
//         fields: [fnInstanceDropdownTemplateModel.dropdownTemplateId],
//         references: [dropdownTemplateModel.id],
//     }),
// }));
