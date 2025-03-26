import { AnyPgColumn, boolean, integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { departmentTypeEnum, fnTemplateTypeEnum } from "../../../../db-enums";
import { relations } from "drizzle-orm";
import { fnTemplateFieldTemplateModel, taskTemplateFnTemplateModel } from "./joins.model";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const fnTemplateModel = pgTable("fn_templates", {
    id: serial().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    description: varchar({ length: 255 }),
    department: departmentTypeEnum().default("SERVICE").notNull(),
    isChoice: boolean().default(false),
    nextFollowUpFnTemplateId: integer("next_follow_up_fn_template_id_fk").references(
        (): AnyPgColumn => fnTemplateModel.id
    ),
    type: fnTemplateTypeEnum().default("NORMAL").notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const fnTemplateRelations = relations(fnTemplateModel, ({ many }) => ({
    taskTemplates: many(taskTemplateFnTemplateModel),
    fieldTemplates: many(fnTemplateFieldTemplateModel),
}));

export const createFnTemplateSchema = createInsertSchema(fnTemplateModel);

export type FnTemplate = z.infer<typeof createFnTemplateSchema>;
