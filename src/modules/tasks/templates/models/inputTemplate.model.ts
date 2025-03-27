import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { conditionTypeEnum, inputTypeEnum } from "../../../../db-enums";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { fieldTemplateInputTemplateModel } from "./joins.model";

export const inputTemplateModel = pgTable("input_templates", {
    id: serial().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    type: inputTypeEnum().default("TEXT").notNull(),
    condition: conditionTypeEnum(),
    comparisonValue: varchar({ length: 255 }),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const inputTemplateRelations = relations(inputTemplateModel, ({ many }) => ({
    fieldTemplates: many(fieldTemplateInputTemplateModel),
}));

export const createInputTemplateSchema = createInsertSchema(inputTemplateModel);

export type InputTemplate = z.infer<typeof createInputTemplateSchema>;
