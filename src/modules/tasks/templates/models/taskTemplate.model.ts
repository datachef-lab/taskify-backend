import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { taskTemplateFnTemplateModel } from "./joins.model";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const taskTemplateModel = pgTable("task_templates", {
    id: serial().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    description: varchar({ length: 255 }),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const taskTemplateRelations = relations(taskTemplateModel, ({ many }) => ({
    fnTemplates: many(taskTemplateFnTemplateModel),
}));

export const createTaskTemplateSchema = createInsertSchema(taskTemplateModel);

export type TaskTemplate = z.infer<typeof createTaskTemplateSchema>;
