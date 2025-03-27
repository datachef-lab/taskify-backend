import { integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { fnTemplateModel, taskTemplateModel } from "../../templates/models";
import { userModel } from "../../../user/models/user.model";
import { relations } from "drizzle-orm";
import { taskInstanceModel } from "./taskInstance.model";
import { fnInstanceDropdownTemplateModel } from "./joins.model";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const fnInstanceModel = pgTable("fn_instances", {
    id: serial().primaryKey(),
    fnTemplateId: integer("fn_template_id_fk")
        .references(() => fnTemplateModel.id)
        .notNull(),
    taskInstanceId: integer("task_instance_id_fk")
        .references(() => taskTemplateModel.id)
        .notNull(),
    remarks: varchar({ length: 1000 }),
    createdById: integer("created_by_user_id_fk")
        .references(() => userModel.id)
        .notNull(),
    assigneeId: integer("assigned_to_user_id_fk")
        .references(() => userModel.id)
        .notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const taskInstanceRelations = relations(fnInstanceModel, ({ one, many }) => ({
    fnTemplate: one(fnTemplateModel, {
        fields: [fnInstanceModel.fnTemplateId],
        references: [fnTemplateModel.id],
    }),
    taskInstance: one(taskInstanceModel, {
        fields: [fnInstanceModel.taskInstanceId],
        references: [taskInstanceModel.id],
    }),
    createdByUser: one(userModel, {
        fields: [fnInstanceModel.createdById],
        references: [userModel.id],
    }),
    assignedToUser: one(userModel, {
        fields: [fnInstanceModel.assigneeId],
        references: [userModel.id],
    }),
    dropdownTemplates: many(fnInstanceDropdownTemplateModel),
}));

export const createFnInstanceSchema = createInsertSchema(fnInstanceModel);

export type FnInstance = z.infer<typeof createFnInstanceSchema>;
