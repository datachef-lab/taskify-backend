import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const dropdownItemModel = pgTable("dropdown_items", {
    id: serial().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const createDropdownItemSchema = createInsertSchema(dropdownItemModel);

export type DropdownItem = z.infer<typeof createDropdownItemSchema>;
