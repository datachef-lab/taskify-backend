import { boolean, integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { taskTemplateModel } from "../../templates/models";
import { customerModel } from "../../../stakeholders/models/customer.model";
import { priorityType } from "../../../../db-enums";
import { userModel } from "../../../user/models/user.model";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { taskInstanceDropdownTemplateModel } from "./joins.model";

export const taskInstanceModel = pgTable("task_instances", {
    id: serial().primaryKey(),
    taskTemplateId: integer("task_template_id_fk")
        .references(() => taskTemplateModel.id)
        .notNull(),
    code: varchar({ length: 255 }).notNull(),
    customerId: integer("customer_id_fk")
        .references(() => customerModel.id)
        .notNull(),
    priority: priorityType().default("NORMAL").notNull(),
    createdById: integer("created_by_user_id_fk")
        .references(() => userModel.id)
        .notNull(),
    assigneeId: integer("assigned_to_user_id_fk")
        .references(() => userModel.id)
        .notNull(),
    isArchived: boolean().default(false),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    closedAt: timestamp(),
});

export const taskInstanceRelations = relations(taskInstanceModel, ({ one, many }) => ({
    taskTemplate: one(taskTemplateModel, {
        fields: [taskInstanceModel.taskTemplateId],
        references: [taskTemplateModel.id],
    }),
    customer: one(customerModel, {
        fields: [taskInstanceModel.customerId],
        references: [customerModel.id],
    }),
    createdByUser: one(userModel, {
        fields: [taskInstanceModel.createdById],
        references: [userModel.id],
    }),
    assignedToUser: one(userModel, {
        fields: [taskInstanceModel.assigneeId],
        references: [userModel.id],
    }),
    dropdownTemplates: many(taskInstanceDropdownTemplateModel),
}));

export const createTaskInstanceSchema = createInsertSchema(taskInstanceModel);

export type TaskInstance = z.infer<typeof createTaskInstanceSchema>;
