import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const parentCompanyModel = pgTable("parent_companies", {
    id: serial().primaryKey(),
    name: varchar({ length: 900 }).notNull(),
    email: varchar({ length: 255 }),
    address: varchar({ length: 900 }),
    state: varchar({ length: 255 }),
    city: varchar({ length: 255 }),
    pincode: varchar({ length: 255 }),
    personOfContact: varchar({ length: 255 }),
    phone: varchar({ length: 15 }),
    businessType: varchar({ length: 255 }),
    headOfficeAddress: varchar({ length: 900 }),
    remark: varchar({ length: 500 }),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const createParentCompanySchema = createInsertSchema(parentCompanyModel);

export type ParentCompany = z.infer<typeof createParentCompanySchema>;
