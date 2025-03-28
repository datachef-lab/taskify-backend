import { integer, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { taskInstanceModel } from "./taskInstance.model";
import { dropdownTemplateModel } from "../../templates/models";
import { relations } from "drizzle-orm";
import { fnInstanceModel } from "./fnInstance.model";

/**
 * Task Instance to Dropdown Template Join Model
 *
 * This many-to-many relationship model connects task instances with dropdown templates.
 * It allows a task instance to use multiple dropdown templates for selection lists,
 * and for dropdown templates to be used across multiple task instances.
 */
export const taskInstanceDropdownTemplateModel = pgTable(
    "task_instances_dropdown_templates",
    {
        // The task instance in the relationship
        taskInstanceId: integer("task_instance_id_fk")
            .notNull()
            .references(() => taskInstanceModel.id),

        // The dropdown template in the relationship
        dropdownTemplateId: integer("dropdown_template_id_fk")
            .notNull()
            .references(() => dropdownTemplateModel.id),
    },
    (table) => ({
        // Composite primary key of both foreign keys
        primaryKey: primaryKey(table.taskInstanceId, table.dropdownTemplateId),
    })
);

/**
 * Task Instance to Dropdown Template Relationships
 *
 * Defines how the join table relates to the entities it connects:
 * - taskInstance: The task instance side of the relationship
 * - dropdownTemplate: The dropdown template side of the relationship
 */
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

/**
 * Function Instance to Dropdown Template Join Model
 *
 * This many-to-many relationship model connects function instances with dropdown templates.
 * It allows a function instance to use multiple dropdown templates for selection lists,
 * and for dropdown templates to be used across multiple function instances.
 */
export const fnInstanceDropdownTemplateModel = pgTable(
    "fn_instances_dropdown_templates",
    {
        // The function instance in the relationship
        fnInstanceId: integer("fn_instance_id_fk")
            .notNull()
            .references(() => fnInstanceModel.id),

        // The dropdown template in the relationship
        dropdownTemplateId: integer("dropdown_template_id_fk")
            .notNull()
            .references(() => dropdownTemplateModel.id),
    },
    (table) => ({
        // Composite primary key of both foreign keys
        primaryKey: primaryKey(table.fnInstanceId, table.dropdownTemplateId),
    })
);

/**
 * Function Instance to Dropdown Template Relationships
 *
 * Defines how the join table relates to the entities it connects:
 * - fnInstance: The function instance side of the relationship
 * - dropdownTemplate: The dropdown template side of the relationship
 */
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
