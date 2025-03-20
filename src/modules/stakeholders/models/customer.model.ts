import { date, integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { parentCompanyModel } from "./parentCompany.model";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const customerModel = pgTable("customers", {
    id: serial().primaryKey(),
    parentCompanyId: integer("parent_company_id_fk").references(() => parentCompanyModel.id),
    name: varchar({ length: 900 }).notNull(),
    email: varchar({ length: 255 }),
    address: varchar({ length: 900 }),
    state: varchar({ length: 255 }),
    city: varchar({ length: 255 }),
    pincode: varchar({ length: 255 }),
    personOfContact: varchar({ length: 255 }),
    phone: varchar({ length: 15 }),
    gst: varchar({ length: 255 }),
    pan: varchar({ length: 255 }),
    residentialAddress: varchar({ length: 900 }),
    birthDate: date(),
    anniversaryDate: date(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const customerRelations = relations(customerModel, ({ one }) => ({
    parentCompany: one(parentCompanyModel, {
        fields: [customerModel.parentCompanyId],
        references: [parentCompanyModel.id],
    }),
}));

export const createCustomerSchema = createInsertSchema(customerModel);

export type Customer = z.infer<typeof createCustomerSchema>;
