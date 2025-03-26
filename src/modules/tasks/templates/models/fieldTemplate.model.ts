import { relations } from "drizzle-orm";
import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { fieldTemplateInputTemplateModel, fnTemplateFieldTemplateModel } from "./joins.model";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const fieldTemplateModel = pgTable("field_templates", {
    id: serial().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    description: varchar({ length: 255 }),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const fieldTemplateRelations = relations(fieldTemplateModel, ({ many }) => ({
    fnTemplates: many(fnTemplateFieldTemplateModel),
    inputTemplates: many(fieldTemplateInputTemplateModel),
}));

export const createFieldTemplateSchema = createInsertSchema(fieldTemplateModel);

export type FieldTemplate = z.infer<typeof createFieldTemplateSchema>;
